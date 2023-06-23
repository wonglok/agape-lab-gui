import {
  AdditiveBlending,
  Color,
  EquirectangularReflectionMapping,
  Object3D,
  Vector3,
  VideoTexture,
  sRGBEncoding,
} from 'three'
import { useFinger } from './useFinger'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Sphere, useEnvironment, MeshTransmissionMaterial } from '@react-three/drei'
import { use, useEffect, useMemo, useRef } from 'react'

//useGLTF, Box, OrthographicCamera
// import { CCDIKSolver, CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver'

export function CameraFinger() {
  let videoTexture = useFinger((r) => r.videoTexture)
  let video = useFinger((r) => r.video)
  let size = useThree((r) => r.size)
  let scene = useThree((r) => r.scene)
  let env = useEnvironment({ files: `/lok/shanghai.hdr` })
  if (videoTexture) {
    videoTexture.encoding = sRGBEncoding
    // scene.background = videoTexture
  }
  scene.environment = env

  let sizeHeight = size.height
  let sizeWidth = size.width

  let vpg = useThree((r) => r.viewport)
  // let camera = useThree((r) => r.camera)
  let aspect = 1

  if (video) {
    aspect = video?.videoWidth / video?.videoHeight
  }
  let vp = { width: 25, height: 25 / aspect }
  let maxVP = Math.max(vp.width, vp.height)
  let minVP = Math.min(vp.width, vp.height)

  let maxSS = 1 // maxVP // Math.max(sizeHeight, sizeWidth)
  let minSS = 1 //minVP // Math.min(sizeHeight, sizeWidth)

  let controls = useThree((r) => r.controls)
  let handLandmarkResult = useFinger((r) => r.handLandmarkResult)
  useEffect(() => {
    useFinger.setState({
      maxVP,
      minVP,
      sizeWidth,
      sizeHeight,
      maxSS,
      minSS,
    })
  })

  return (
    <>
      <mesh position={[0, 0, -1]} scale={[1, 1, 1]}>
        <planeGeometry args={[vp.width, vp.height]}></planeGeometry>
        {handLandmarkResult ? (
          <meshBasicMaterial
            depthWrite={true}
            opacity={1}
            depthTest={true}
            map={videoTexture}
            transparent={false}></meshBasicMaterial>
        ) : (
          <meshBasicMaterial color={'#bababa'}></meshBasicMaterial>
        )}
      </mesh>

      <group position={[0, 0, -1]}>
        {controls &&
          video &&
          handLandmarkResult &&
          handLandmarkResult.map((hand, handIDX) => {
            return (
              hand
                // .filter((f, fi) => fi === 4)
                .map((finger, fingerIDX) => {
                  if (fingerIDX !== 8) {
                    return null
                  }
                  //
                  return (
                    <group
                      key={`${handIDX}_${fingerIDX}`}
                      position={[
                        vp.width * finger.x - vp.width * 0.5,
                        vp.height * -finger.y + vp.height * 0.5,
                        finger.z * vpg.distance,
                      ]}
                      scale={[1, 1, 1]}>
                      {/*  */}
                      <Text scale={1} position={[0, 0, 1]} fontSize={0.3} color={'#ff0000'}>
                        {fingerIDX}
                      </Text>

                      <group
                        userData={{
                          forceSize: 3,
                          forceTwist: -3.141592 * 2.0,
                          forceType: 'vortexZ',
                          type: 'ForceField',
                        }}>
                        <Sphere args={[1, 32, 32]}>
                          <MeshTransmissionMaterial
                            metalness={0}
                            roughness={0.1}
                            thickness={1.1}
                            backsideThickness={1.1}></MeshTransmissionMaterial>
                        </Sphere>
                      </group>
                    </group>
                  )
                })
            )
          })}
      </group>

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
        numHands: 4,
      })

      useFinger.setState({ handLandmarker })
    }

    tsk()
  }, [])

  let handLandmarker = useFinger((r) => r.handLandmarker)
  let video = useFinger((r) => r.video)

  // let handLandmarkResult = useFinger((r) => r.handLandmarkResult)
  useFrame(({ viewport }) => {
    if (handLandmarker && video) {
      const result = handLandmarker.detect(video)

      useFinger.setState({ handLandmarkResult: result.landmarks })
    }
  })

  // let sizeHeight = useFinger((r) => r.sizeHeight)
  // let sizeWidth = useFinger((r) => r.sizeWidth)
  // let minSS = useFinger((r) => r.minSS)
  // let maxSS = useFinger((r) => r.maxSS)
  // let maxVP = useFinger((r) => r.maxVP)

  let size = useThree((r) => r.size)
  let vpg = useThree((r) => r.viewport)
  let camera = useThree((r) => r.camera)
  let vp = vpg.getCurrentViewport(camera, [0, 0, -1], size)

  return <></>
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
            className='p-3 px-6 bg-gray-200 border border-black cursor-pointer rounded-3xl'
            onClick={() => {
              useFinger.setState({ menuText: 'Loading...' })
              let video = document.createElement('video')
              video.playsInline = true
              window.navigator.mediaDevices
                //
                .getUserMedia({
                  video: {
                    frameRate: 30,
                    height: { ideal: 720 },
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
