import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { Color, CubicBezierCurve3, MathUtils, MeshBasicMaterial } from 'three'
import { BoxGeometry } from 'three'
import { CubicBezierCurve, TubeGeometry } from 'three'
import {
  EquirectangularReflectionMapping,
  ExtrudeGeometry,
  Mesh,
  Object3D,
  PlaneGeometry,
  Raycaster,
  Vector3,
  VideoTexture,
  sRGBEncoding,
} from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { create } from 'zustand'

//
export const useMouse = create((set, get) => {
  return {
    handID: false,
    //
    handResult: false,
    hands: [],
    scene: false,
    camera: false,
    picking: [],
    activeObjects: [],
    activeUUID: false,
    viewport: false,
    loading: false,
    showStartMenu: true,
    video: false,
    videoTexture: false,
    onLoop: () => {},
    cancel: () => {},
    cleanVideoTexture: () => {},
    runProcessVideoFrame: () => {},
    initVideo: () => {
      set({ loading: true })
      let video = document.createElement('video')
      video.playsInline = true
      let width = window.innerWidth
      let height = window.innerHeight
      if (width >= height) {
        video.width = 512
        video.height = 512 * (height / width)
      }
      if (width < height) {
        video.width = 512 * (width / height)
        video.height = 512
      }
      let stream = navigator.mediaDevices.getUserMedia({
        video: {
          width: width,
          height: height,
        },
      })
      stream.then((r) => {
        video.srcObject = r
        video.onloadeddata = () => {
          let videoTexture = new VideoTexture(video)
          videoTexture.encoding = sRGBEncoding
          videoTexture.mapping = EquirectangularReflectionMapping
          let id = 0
          let canRun = true
          let func = () => {
            if (canRun) {
              id = video.requestVideoFrameCallback(func)
            }
            videoTexture.needsUpdate = true
            get().runProcessVideoFrame({ video })
          }
          id = video.requestVideoFrameCallback(func)
          get().cancel()
          set({
            cancel: () => {
              let recogizer = get().recogizer
              if (recogizer?.close) {
                recogizer.close()
              }
              canRun = false
            },
            vid: id,
            videoTexture: videoTexture,
            video: video,
          })
          set({ loading: false, showStartMenu: false })
        }
        video.play()
      })
    },
    initTask: async () => {
      const handCount = 1
      // Create task for image file processing:
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        '/gesture-vision_wasm-v-0.10.4',
      )
      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/gesture-vision_wasm-v-0.10.4/gesture_recognizer.task',
          delegate: 'GPU',
        },
        numHands: handCount,
        runningMode: 'VIDEO',
      })
      setTimeout(() => {
        handLandmarker.setOptions({ baseOptions: { delegate: 'GPU' }, numHands: handCount, runningMode: 'VIDEO' })
        console.log('set to gpu')
      }, 100)
      set({ recogizer: gestureRecognizer })
      let handLandmarker = gestureRecognizer
      // let raycaster = new Raycaster()
      let array = []
      let eachHandPointCount = 21
      let dotCount = handCount * eachHandPointCount // plus 1 for palm
      for (let i = 0; i < dotCount; i++) {
        array.push(new Object3D())
      }
      array.map((r) => {
        r.visible = true
        return r
      })
      let handRootOfFristHand = array[0 * eachHandPointCount + 7]
      handRootOfFristHand.clear()
      let stick = new Mesh(new BoxGeometry(0.02, 0.02, 8), new MeshBasicMaterial({ color: 0xff00ff }))
      stick.geometry.translate(0, 0, 8 / 2)
      stick.name = 'handFingerStick'
      stick.visible = false
      let handFingerStick = get()?.scene?.getObjectByName('handFingerStick')
      handFingerStick?.removeFromParent()
      get().scene.add(stick)
      let raycaster = new Raycaster()
      let dir = new Vector3()
      let plane = new Mesh(
        new PlaneGeometry(1000, 1000, 100, 100),
        new MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 1.0 }),
      )
      plane.position.z = -5
      plane.name = 'raycast-plane'
      let targetGoal = new Vector3()

      set({
        onLoop: () => {
          //
          {
            let handIndex = 0
            let beforeTip = array[handIndex * eachHandPointCount + 6]
            let indexTip = array[handIndex * eachHandPointCount + 8]
            beforeTip.lookAt(indexTip.position)
            let picking = get()?.picking || []
            picking.forEach((it) => {
              if (it) {
                it.getWorldPosition(plane.position)
                plane.lookAt(get().camera.position)
                let raycaster = new Raycaster()
                beforeTip.getWorldDirection(dir)
                raycaster.set(beforeTip.position, dir)
                raycaster.firstHitOnly = true
                let results = raycaster.intersectObject(plane)
                let result = results[0]
                if (it && it.material && result) {
                  it.material.transparent = true
                  it.material.opacity = 0.5
                  targetGoal.set(result.point.x, result.point.y, it.position.z)
                  it.position.lerp(targetGoal, 0.35)
                }
              }
            })
          }

          ///
        },
        hands: array,
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let nowInMs = Date.now()
            let result = handLandmarker.recognizeForVideo(video, nowInMs, {
              rotationDegrees: 0,
            })
            // console.log(result)
            array.map((r) => {
              r.visible = false
              return r
            })
            {
              stick.visible = false
            }
            let cam = get().camera
            let target = get().controlsTarget
            if (cam && target) {
              let vp = get().viewport.getCurrentViewport(cam, target)
              if (vp && result && result?.landmarks?.length > 0) {
                set({ handResult: result })
                {
                  stick.visible = true
                }
                result.landmarks.forEach((lmk, handIndex) => {
                  let vpx = (lmk[0].x * 2.0 - 1.0) * 0.75 * vp.width
                  let vpy = (lmk[0].y * 2.0 - 1.0) * 0.75 * vp.height
                  let vpz = lmk[0].z
                  for (let bone = 0; bone < eachHandPointCount; bone++) {
                    let hand = array[handIndex * eachHandPointCount + bone]
                    let wmk = result.worldLandmarks[handIndex][bone]
                    hand.position.set(-wmk.x, -wmk.y, wmk.z).multiplyScalar(20)
                    hand.position.x += -vpx
                    hand.position.y += -vpy
                    hand.position.z += -vpz

                    hand.visible = true

                    if (bone === 1) {
                      hand.visible = false
                    }
                    if (bone === 2) {
                      hand.visible = false
                    }
                  }

                  {
                    let beforeTip = array[handIndex * eachHandPointCount + 7]
                    let indexTip = array[handIndex * eachHandPointCount + 8]
                    beforeTip.lookAt(indexTip.position)
                    //
                    beforeTip.getWorldDirection(dir)
                    raycaster.set(beforeTip.position, dir)
                    let casterGroup = get().scene.getObjectByName('raycast-group')
                    if (casterGroup && get()?.picking?.length === 0) {
                      raycaster.firstHitOnly = false
                      let res = raycaster.intersectObject(casterGroup, true)
                      if (res) {
                        get().activeObjects?.forEach((it) => {
                          if (it) {
                            it.material.emissive = new Color(0x000000)
                          }
                        })
                        set({
                          activeObjects: res.map((r) => {
                            let it = r.object
                            it.userData.raycastPoint = r.point
                            it.material.emissive = new Color(0x555555)
                            return it
                          }),
                        })
                      }
                    }
                  }

                  {
                    handRootOfFristHand.getWorldPosition(stick.position)
                    handRootOfFristHand.getWorldQuaternion(stick.quaternion)
                    get().handResult?.landmarks?.forEach((lmk, handIndex) => {
                      //
                      {
                        let thumbTip = array[handIndex * eachHandPointCount + 4]
                        let midTip = array[handIndex * eachHandPointCount + 12]
                        if (thumbTip.position.distanceTo(midTip.position) > 0.7) {
                          set((b4) => {
                            if (b4.picking && b4.picking.length > 0) {
                              return { ...b4, picking: [] }
                            } else {
                              return { ...b4 }
                            }
                          })
                        } else if (thumbTip.position.distanceTo(midTip.position) <= 0.5) {
                          set((b4) => {
                            if (b4.picking?.length === 0 && get()?.activeObjects[0]) {
                              return { ...b4, picking: [get()?.activeObjects[0]] }
                            } else {
                              return b4
                            }
                          })
                        } else {
                        }
                      }
                    })
                  }
                  // let gestureInfo = result.gestures[handIndex]
                  // // let floor_ground = get()?.scene?.getObjectByName('floor_ground')
                  // let rootXYZ = result.worldLandmarks[handIndex][0]
                  // handRoot.position.set(vpx + rootXYZ, vpy, vpz).multiplyScalar(-1)
                  // let midFinger1X = (lmk[9].x * 2.0 - 1.0) * vp.width
                  // let midFinger1Y = (lmk[9].y * 2.0 - 1.0) * vp.height
                  // let midFinger1Z = lmk[9].z
                  // midFingerRoot.position.set(midFinger1X, midFinger1Y, midFinger1Z).multiplyScalar(-1)
                  // handRoot.lookAt(midFingerRoot.position)
                })
                //
              }
            }
          }
        },
      })
    },
  }
})
