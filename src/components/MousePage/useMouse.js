import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import { EquirectangularReflectionMapping, VideoTexture, sRGBEncoding } from 'three'
import { create } from 'zustand'
//

export const useMouse = create((set, get) => {
  return {
    //
    loading: false,
    showStartMenu: true,
    video: false,
    videoTexture: false,
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
          let func = () => {
            videoTexture.needsUpdate = true
            get().runProcessVideoFrame({ videoTexture })
            id = video.requestVideoFrameCallback(func)
          }
          id = video.requestVideoFrameCallback(func)

          console.log(videoTexture)
          set({
            videoTexture: videoTexture,
            video: video,
          })
          set({ loading: false, showStartMenu: false })
        }
        video.play()
      })
    },
    initTask: async () => {
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
        numHands: 1,
      })

      set({
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let result = gestureRecognizer.recognizeForVideo(video, performance.now())
            if (result) {
              set({ handResult: result })
            }
          }
        },
      })
    },
  }
})
