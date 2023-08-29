import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { CubicBezierCurve3, MeshBasicMaterial } from 'three'
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
      const handCount = 2
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
      //   numHands: handCount,
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
      let eachHandPointCount = 5 + 0
      let dotCount = handCount * eachHandPointCount // plus 1 for palm
      for (let i = 0; i < dotCount; i++) {
        array.push(new Object3D())
      }
      array.map((r) => {
        r.visible = true
        return r
      })

      let plGeo = new PlaneGeometry(1000000, 1000000)
      let tempPlane = new Mesh(plGeo)
      let v0 = new Vector3(0, 0, 0)
      let v1 = new Vector3(0, 0, 0)
      let v2 = new Vector3(0, 0, 0)
      let v3 = new Vector3(0, 0, 0)

      let curve = new CubicBezierCurve3(v0, v1, v2, v3)
      let tube = new Mesh(undefined, new MeshBasicMaterial({ color: '#ff0000' }))
      if (!get().scene.children.includes(tube)) {
        get().scene.add(tube)
      }

      get().scene.add(tube)

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

                console.log(handIndex, gestureInfo[0]?.categoryName)

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

                // {
                //   // raycaster.setFromCamera({ x: x, y: y }, get().camera)

                //   // if (floor_ground) {
                //   //   let res = raycaster.intersectObject(floor_ground, true)
                //   //   if (res && res[0]) {
                //   //     ptA.copy(res[0]?.point)
                //   //   }
                //   // }

                //   let indexRoot = 9
                //   let x = (lmk[indexRoot].x * 2.0 - 1.0) * -1
                //   let y = (lmk[indexRoot].y * 2.0 - 1.0) * -1

                //   let palmRoot = 0
                //   let x2 = (lmk[palmRoot].x * 2.0 - 1.0) * -1
                //   let y2 = (lmk[palmRoot].y * 2.0 - 1.0) * -1

                //   let mix = (a, b, r) => {
                //     return a * (1.0 - r) + b * r
                //   }

                //   raycaster.setFromCamera({ x: mix(x, x2, 0.5), y: mix(y, y2, 0.5) }, get().camera)

                //   if (floor_ground) {
                //     let res = raycaster.intersectObject(floor_ground, true)
                //     let idx = res.findIndex((r) => r.uuid === get()?.handID)
                //     if (idx === -1) {
                //       idx = 0
                //     }
                //     if (res && res[idx]) {
                //       let pt = res[idx]?.point

                //       let found = res[idx].object

                //       if (tempPlane && (found?.userData?.draggable || found?.userData?.hoverable)) {
                //         tempPlane.position.copy(pt)
                //         tempPlane.lookAt(get().camera.position)

                //         let tempCoordRes = raycaster.intersectObject(tempPlane, true)
                //         if (found?.userData?.draggable && gestureInfo[0]?.categoryName === 'Closed_Fist') {
                //           if (!get().handID) {
                //             set({ handID: found.uuid })
                //           }
                //         }

                //         if (get().handID === found.uuid) {
                //           if (gestureInfo[0]?.categoryName === 'Closed_Fist') {
                //             if (tempCoordRes && tempCoordRes[0]?.point) {
                //               let tempCoord = tempCoordRes[0]?.point
                //               found.position.set(tempCoord.x, tempCoord.y, found.position.z)
                //             }
                //           } else {
                //             set({ handID: false })
                //           }
                //         }

                //         if (array[handIndex * eachHandPointCount + 5]) {
                //           array[handIndex * eachHandPointCount + 5].position.set(pt.x, pt.y, found.position.z)
                //           array[handIndex * eachHandPointCount + 5].visible = true
                //           array[handIndex * eachHandPointCount + 5].userData = {
                //             gestureInfo: gestureInfo,
                //             handIndex: handIndex,
                //           }
                //         }
                //       }
                //     }
                //   }
                // }

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
