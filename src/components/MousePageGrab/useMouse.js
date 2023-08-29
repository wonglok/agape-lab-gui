import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { CubicBezierCurve3, MeshBasicMaterial } from 'three'
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
import { create } from 'zustand'
//

export const useMouse = create((set, get) => {
  return {
    handID: false,
    //
    hands: [],
    scene: false,
    camera: false,

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
        handLandmarker.setOptions({ baseOptions: { delegate: 'GPU' }, numHands: handCount })
        console.log('set to gpu')
      }, 100)

      set({ recogizer: gestureRecognizer })

      let handLandmarker = gestureRecognizer

      let raycaster = new Raycaster()
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

      let handRootOfFristHand = array[0 * eachHandPointCount + 5]

      handRootOfFristHand.clear()
      let stick = new Mesh(new BoxGeometry(0.1, 0.1, 5), new MeshBasicMaterial({ color: 0xff0000 }))
      stick.geometry.translate(0, 0, 5 / 2)

      get().scene.add(stick)

      set({
        onLoop: () => {
          //

          handRootOfFristHand.getWorldPosition(stick.position)
          handRootOfFristHand.getWorldQuaternion(stick.quaternion)
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

            let cam = get().camera
            let target = get().controlsTarget
            if (cam && target) {
              let vp = get().viewport.getCurrentViewport(cam, target)
              // console.log(vp.getCurrentViewport())

              if (vp && result && result?.landmarks?.length > 0) {
                set({ handResult: result })

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
                  }

                  {
                    let handRoot = array[handIndex * eachHandPointCount + 5]
                    let handMid1 = array[handIndex * eachHandPointCount + 8]
                    handRoot.lookAt(handMid1.position)
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

            set({ hands: array.filter((r) => r.visible) })
          }
        },
      })
    },
  }
})
