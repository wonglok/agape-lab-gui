import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { Color, CubicBezierCurve3, DoubleSide, MathUtils, MeshBasicMaterial, Ray } from 'three'
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
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { create } from 'zustand'
import { Mini } from './Noodle/Mini'
import { CursorTrackerTail } from './Noodle/CursorTrackerTail'

//
export const useMouse = create((set, get) => {
  return {
    bloomLights: [],
    bloomMeshes: [],
    handID: false,
    //
    collider: false,
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
    cleanMini: () => {},
    onLoop: () => {},
    cancel: () => {},
    cleanVideoTexture: () => {},
    runProcessVideoFrame: () => {},
    initVideo: () => {
      set({ inited: true })
      set({ loading: true })
      let video = document.createElement('video')
      video.playsInline = true
      let width = window.innerWidth
      let height = window.innerHeight
      // if (width >= height) {
      //   video.width = 512
      //   video.height = 512 * (height / width)
      // }
      // if (width < height) {
      //   video.width = 512 * (width / height)
      //   video.height = 512
      // }

      let stream = navigator.mediaDevices.getUserMedia({
        video: {
          width: 256,
          height: 256,
        },
        audio: false,
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

      let cursor = new Object3D()
      get().scene.add(cursor)

      let tail = new CursorTrackerTail({
        gl: get().gl,
        mini: new Mini({}),
        camera: get().camera,
        mounter: get().scene,
        cursor: cursor,
        color: new Color('#ffffff'),
        onInsert: (v) => {
          set({
            bloomMeshes: [v],
          })
        },
      })

      set({
        cleanMini: () => {
          tail.mini.clean()
        },
      })
      let ray = new Ray()
      set({
        onLoop: (st, dt) => {
          {
            tail.mini.work(st, dt)
            let collider = get().collider
            let geometry = collider?.geometry
            let boundsTree = geometry?.boundsTree

            let handIndex = 0
            let beforeTip = array[handIndex * eachHandPointCount + 6]
            let indexTip = array[handIndex * eachHandPointCount + 8]
            beforeTip.lookAt(indexTip.position)
            beforeTip.getWorldDirection(dir)

            ray.set(beforeTip.position, dir)

            let res = boundsTree.raycastFirst(ray, DoubleSide)

            let activeObjects = get().activeObjects
            if (activeObjects && activeObjects.length > 0) {
              cursor.position.lerp(activeObjects[0].userData.raycastPoint, 0.1)
            } else {
              if (res) {
                cursor.position.lerp(res.point, 0.1)
              }
            }
          }
          // console.log(cursor.position)

          //
          {
            let handIndex = 0
            let beforeTip = array[handIndex * eachHandPointCount + 6]
            let indexTip = array[handIndex * eachHandPointCount + 8]
            beforeTip.lookAt(indexTip.position)
            let picking = get()?.picking || []
            picking.forEach((picked) => {
              if (picked) {
                picked.traverseAncestors((it) => {
                  if (it?.userData?.dragGroup) {
                    picked.getWorldPosition(plane.position)
                    plane.lookAt(get().camera.position)
                    let raycaster = new Raycaster()
                    beforeTip.getWorldDirection(dir)
                    raycaster.set(beforeTip.position, dir)
                    raycaster.firstHitOnly = true
                    let results = raycaster.intersectObject(plane)
                    let result = results[0]
                    if (picked && picked.material && result) {
                      picked.material.transparent = true
                      picked.material.opacity = 0.5
                      targetGoal.set(result.point.x, result.point.y, it.position.z)
                      it.position.lerp(targetGoal, 0.2)
                    }
                  }
                })
              }
            })
          }

          ///
        },
      })

      let goal = new Object3D()
      set({
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
              let vp = {
                width: 10,
                height: 10,
              }
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
                    goal.position.set(-wmk.x, -wmk.y, wmk.z).multiplyScalar(20)
                    goal.position.x += -vpx
                    goal.position.y += -vpy
                    goal.position.z += -vpz
                    goal.position.z += 0

                    hand.position.lerp(goal.position, 0.3)
                    hand.visible = true

                    // if (bone === 7) {
                    //   hand.visible = true
                    // }
                    // if (bone === 8) {
                    //   hand.visible = true
                    // }
                    // if (bone === 4) {
                    //   hand.visible = true
                    // }
                    // if (bone === 12) {
                    //   hand.visible = true
                    // }

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
                    //
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
                        } else if (thumbTip.position.distanceTo(midTip.position) <= 0.55) {
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

                  //
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
