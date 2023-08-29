import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import { EquirectangularReflectionMapping, Object3D, Raycaster, VideoTexture, sRGBEncoding } from 'three'
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

      let width = 1
      let height = 1

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
      const count = 8
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
        runningMode: 'VIDEO',
        numHands: count,
      })

      let raycaster = new Raycaster()
      let array = []
      let eachHandPointCount = 2
      let dotCount = count * eachHandPointCount
      for (let i = 0; i < dotCount; i++) {
        array.push(new Object3D())
      }
      array.map((r) => {
        r.visible = false
        return r
      })

      setTimeout(() => {
        gestureRecognizer.setOptions({ baseOptions: { delegate: 'GPU' } })
        console.log('set to gpu')
      }, 100)

      set({
        hands: array,
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let nowInMs = Date.now()
            let result = gestureRecognizer.recognizeForVideo(video, nowInMs, {
              rotationDegrees: 90,
            })
            if (result && result?.gestures?.length > 0) {
              set({ handResult: result })

              array.map((r) => {
                r.visible = false
                return r
              })

              // console.log(result)
              result.landmarks.forEach((lmk, index) => {
                //

                let floor_ground = get()?.scene?.getObjectByName('floor_ground')

                {
                  let fingerTip = 8
                  let x = (lmk[fingerTip].x * 2.0 - 1.0) * -1
                  let y = (lmk[fingerTip].y * 2.0 - 1.0) * -1

                  raycaster.setFromCamera({ x: x, y: y }, get().camera)

                  //
                  if (floor_ground) {
                    let res = raycaster.intersectObject(floor_ground, true)
                    if (res && res[0] && array[index * eachHandPointCount + 0]) {
                      array[index * eachHandPointCount + 0].position.copy(res[0]?.point)
                      array[index * eachHandPointCount + 0].visible = true
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
                    if (res && res[0] && array[index * eachHandPointCount + 1]) {
                      array[index * eachHandPointCount + 1].position.copy(res[0]?.point)
                      array[index * eachHandPointCount + 1].visible = true
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
                    if (res && res[0] && array[index * eachHandPointCount + 2]) {
                      array[index * eachHandPointCount + 2].position.copy(res[0]?.point)
                      array[index * eachHandPointCount + 2].visible = true
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
                    if (res && res[0] && array[index * eachHandPointCount + 3]) {
                      array[index * eachHandPointCount + 3].position.copy(res[0]?.point)
                      array[index * eachHandPointCount + 3].visible = true
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
                    if (res && res[0] && array[index * eachHandPointCount + 4]) {
                      array[index * eachHandPointCount + 4].position.copy(res[0]?.point)
                      array[index * eachHandPointCount + 4].visible = true
                    }
                  }
                }

                ////////
              })

              set({ hands: [...array] })
            }
          }
        },
      })
    },
  }
})
