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
      for (let i = 0; i < count; i++) {
        array.push(new Object3D())
      }
      set({
        hands: array,
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let result = gestureRecognizer.recognizeForVideo(video, performance.now())
            if (result && result?.gestures?.length > 0) {
              set({ handResult: result })

              array.map((r) => {
                r.visible = false
                return r
              })

              // console.log(result)
              result.landmarks.forEach((lmk, index) => {
                //

                let x = (lmk[0].x * 2.0 - 1.0) * -1
                let y = (lmk[0].y * 2.0 - 1.0) * -1

                raycaster.setFromCamera({ x: x, y: y }, get().camera)

                let floor_ground = get()?.scene?.getObjectByName('floor_ground')
                //
                if (floor_ground) {
                  let res = raycaster.intersectObject(floor_ground, true)
                  if (res && res[0] && array[index]) {
                    array[index].position.copy(res[0]?.point)
                    array[index].visible = true
                  }
                }
              })

              set({ hands: [...array] })
            }
          }
        },
      })
    },
  }
})
