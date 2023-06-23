import { Vector3, VideoTexture, sRGBEncoding } from 'three'
import { useFinger } from './useFinger'
import { useFrame, useThree } from '@react-three/fiber'
import { Box, OrthographicCamera } from '@react-three/drei'
import { use, useEffect, useRef } from 'react'

export function CameraFinger() {
  let videoTexture = useFinger((r) => r.videoTexture)
  let video = useFinger((r) => r.video)
  let size = useThree((r) => r.size)

  let sizeHeight = size.height
  let sizeWidth = size.width

  let maxSS = Math.max(sizeHeight, sizeWidth)
  let minSS = Math.min(sizeHeight, sizeWidth)

  useEffect(() => {
    useFinger.setState({
      sizeWidth,
      sizeHeight,
      maxSS,
      minSS,
    })
  })

  return (
    <>
      {/*  */}

      {video && (
        <OrthographicCamera
          position={[0, 0, 25]}
          near={0}
          far={25 * 2}
          top={size.height / 2}
          right={size.width / 2}
          bottom={size.height / -2}
          left={size.width / -2}
          makeDefault></OrthographicCamera>
      )}

      {videoTexture && (
        <>
          <mesh scale={[1, 1, 1]}>
            <planeGeometry args={[maxSS, maxSS]}></planeGeometry>
            <meshBasicMaterial
              depthWrite={false}
              opacity={1}
              map={videoTexture}
              transparent={false}></meshBasicMaterial>
          </mesh>
        </>
      )}

      {/*  */}

      {/*  */}
    </>
  )
}

export function FingerDetection({}) {
  useEffect(() => {
    let tsk = async () => {
      let { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
      )

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `/finger/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numHands: 2,
      })

      useFinger.setState({ handLandmarker })
    }

    tsk()
  }, [])

  let handLandmarker = useFinger((r) => r.handLandmarker)
  let video = useFinger((r) => r.video)

  let worldLandmarks = useFinger((r) => r.worldLandmarks)
  useFrame(({ viewport }) => {
    if (handLandmarker && video) {
      const result = handLandmarker.detect(video)

      useFinger.setState({ worldLandmarks: result.landmarks })
    }
  })

  let sizeHeight = useFinger((r) => r.sizeHeight)
  let sizeWidth = useFinger((r) => r.sizeWidth)
  let minSS = useFinger((r) => r.minSS)
  let maxSS = useFinger((r) => r.maxSS)

  return (
    <>
      {video &&
        worldLandmarks &&
        worldLandmarks.map((hand, handIDX) => {
          return hand.map((finger, fingerIDX) => {
            return (
              <group
                key={`${handIDX}_${fingerIDX}`}
                position={[maxSS * finger.x - maxSS * 0.5, maxSS * -finger.y + maxSS * 0.5, finger.z * 1.0]}
                scale={[1, 1, 1]}>
                <Box scale={[10, 10, 10]}>
                  <meshBasicMaterial color={'#ff0000'}></meshBasicMaterial>
                </Box>
              </group>
            )
          })
        })}
    </>
  )
}

export function CameraMenu() {
  //
  let noMenu = useFinger((r) => r.noMenu)
  let menuText = useFinger((r) => r.menuText)
  //

  return (
    <>
      {/*  */}
      {!noMenu && (
        <div
          className=' flex items-center justify-center'
          style={{ position: 'absolute', width: '80px', top: `calc(50% - 80px / 2)`, left: `calc(50% - 80px / 2)` }}>
          <div
            className='p-3 px-6 bg-gray-200 cursor-pointer rounded-3xl'
            onClick={() => {
              useFinger.setState({ menuText: 'Loading...' })
              let video = document.createElement('video')
              window.navigator.mediaDevices
                //
                .getUserMedia({
                  video: {
                    height: { ideal: 1280 },
                    width: { ideal: 1280 },
                  },
                  audio: false,
                })
                //
                .then((stream) => {
                  //
                  video.oncanplay = () => {
                    video.play()
                    let videoTexture = new VideoTexture(video)
                    videoTexture.encoding = sRGBEncoding
                    videoTexture.needsUpdate = true
                    useFinger.setState({ noMenu: true, menuText: '', video, videoTexture })
                    setTimeout(() => {
                      window.dispatchEvent(new Event('resize'))
                    })
                  }
                  video.srcObject = stream
                })
            }}>
            {menuText}
          </div>
        </div>
      )}

      {/*  */}
    </>
  )
}
