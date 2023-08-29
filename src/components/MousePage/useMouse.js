import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { EquirectangularReflectionMapping, Object3D, Raycaster, Vector3, VideoTexture, sRGBEncoding } from 'three'
import { create } from 'zustand'
//

export const useMouse = create((set, get) => {
  return {
    //
    hands: [],
    scene: false,
    camera: false,

    loading: false,
    showStartMenu: true,
    video: false,
    videoTexture: false,
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

              if (recogizer.close) {
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
      const count = 2
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
        numHands: count,
        runningMode: 'VIDEO',
      })

      setTimeout(() => {
        handLandmarker.setOptions({ baseOptions: { delegate: 'GPU' }, numHands: count })
        console.log('set to gpu')
      }, 100)

      set({ recogizer: gestureRecognizer })

      // const vision = await FilesetResolver.forVisionTasks(
      //   'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
      // )

      // const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      //   baseOptions: {
      //     modelAssetPath: `/finger/hand_landmarker.task`,
      //     delegate: 'GPU',
      //   },
      //   // runningMode: 'IMAGE',
      //   runningMode: 'VIDEO',
      //   numHands: count,
      //   // // /**
      //   // //  * The minimum confidence score for the hand detection to be considered
      //   // //  * successful. Defaults to 0.5.
      //   // //  */
      //   minHandDetectionConfidence: 0.1,
      //   // // /**
      //   // //  * The minimum confidence score of hand presence score in the hand landmark
      //   // //  * detection. Defaults to 0.5.
      //   // //  */
      //   minHandPresenceConfidence: 0.1,
      //   // // /**
      //   // //  * The minimum confidence score for the hand tracking to be considered
      //   // //  * successful. Defaults to 0.5.
      //   // //  */
      //   minTrackingConfidence: 0.1,
      // })
      let handLandmarker = gestureRecognizer

      let raycaster = new Raycaster()
      let array = []
      let eachHandPointCount = 5
      let dotCount = count * eachHandPointCount + 1 // plus 1 for palm
      for (let i = 0; i < dotCount; i++) {
        array.push(new Object3D())
      }
      array.map((r) => {
        r.visible = false
        return r
      })

      let ptA = new Vector3()
      let ptB = new Vector3()

      set({
        hands: array,
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let nowInMs = Date.now()
            let result = handLandmarker.recognizeForVideo(video, nowInMs, {
              rotationDegrees: 0,
            })

            array.map((r) => {
              r.visible = false
              return r
            })

            if (result && result?.landmarks?.length > 0) {
              set({ handResult: result })

              result.landmarks.forEach((lmk, handIndex) => {
                //
                let gestureInfo = result.gestures[handIndex]

                console.log(gestureInfo[0]?.categoryName)

                let floor_ground = get()?.scene?.getObjectByName('floor_ground')

                {
                  let fingerTip = 8
                  let x = (lmk[fingerTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[fingerTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[handIndex * eachHandPointCount + 0]) {
                      array[handIndex * eachHandPointCount + 0].position.copy(res[0]?.point)
                      array[handIndex * eachHandPointCount + 0].visible = true
                      array[handIndex * eachHandPointCount + 0].userData = {
                        gestureInfo: gestureInfo,
                        handIndex: handIndex,
                      }
                    }
                  }
                }
                ////////

                {
                  let thumbTip = 4
                  let x = (lmk[thumbTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[thumbTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[handIndex * eachHandPointCount + 1]) {
                      array[handIndex * eachHandPointCount + 1].position.copy(res[0]?.point)
                      array[handIndex * eachHandPointCount + 1].visible = true
                      array[handIndex * eachHandPointCount + 1].userData = {
                        gestureInfo: gestureInfo,
                        handIndex: handIndex,
                      }
                    }
                  }
                }

                ////////

                {
                  let thumbTip = 12
                  let x = (lmk[thumbTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[thumbTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[handIndex * eachHandPointCount + 2]) {
                      array[handIndex * eachHandPointCount + 2].position.copy(res[0]?.point)
                      array[handIndex * eachHandPointCount + 2].visible = true
                      array[handIndex * eachHandPointCount + 2].userData = {
                        gestureInfo: gestureInfo,
                        handIndex: handIndex,
                      }
                    }
                  }
                }

                ////////

                {
                  let thumbTip = 16
                  let x = (lmk[thumbTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[thumbTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[handIndex * eachHandPointCount + 3]) {
                      array[handIndex * eachHandPointCount + 3].position.copy(res[0]?.point)
                      array[handIndex * eachHandPointCount + 3].visible = true
                      array[handIndex * eachHandPointCount + 3].userData = {
                        gestureInfo: gestureInfo,
                        handIndex: handIndex,
                      }
                    }
                  }
                }

                ////////

                {
                  let thumbTip = 20
                  let x = (lmk[thumbTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[thumbTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[handIndex * eachHandPointCount + 4]) {
                      array[handIndex * eachHandPointCount + 4].position.copy(res[0]?.point)
                      array[handIndex * eachHandPointCount + 4].visible = true
                      array[handIndex * eachHandPointCount + 4].userData = {
                        gestureInfo: gestureInfo,
                        handIndex: handIndex,
                      }
                    }
                  }
                }

                ////////

                {
                  let indexRoot = 5
                  let x = (lmk[indexRoot].x * 2.0 - 1.0) * -1
                  let y = (lmk[indexRoot].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0]) {
                      ptA.copy(res[0]?.point)
                    }
                  }

                  let palmRoot = 0
                  let x2 = (lmk[palmRoot].x * 2.0 - 1.0) * -1
                  let y2 = (lmk[palmRoot].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x2, y: y2 }, get().camera)

                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0]) {
                      ptB.copy(res[0]?.point)
                    }
                  }
                }

                ////////
              })
            }

            set({ hands: array.filter((r) => r.visible) })
          }
        },
      })
    },
  }
})
