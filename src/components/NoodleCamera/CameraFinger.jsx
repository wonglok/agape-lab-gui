import {
  AdditiveBlending,
  Color,
  EquirectangularReflectionMapping,
  MathUtils,
  Object3D,
  Vector3,
  VideoTexture,
  sRGBEncoding,
} from 'three'
import { useFinger } from './useFinger'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Sphere, useEnvironment, MeshTransmissionMaterial, Cone, OrbitControls } from '@react-three/drei'
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
  env.mapping = EquirectangularReflectionMapping
  scene.environment = env
  scene.background = env

  let sizeHeight = size.height
  let sizeWidth = size.width

  // let camera = useThree((r) => r.camera)
  let aspect = 1

  if (video) {
    aspect = video?.videoWidth / video?.videoHeight
  }
  let vp = { width: 60, height: 60 / aspect }
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
  let arr = useMemo(() => {
    return []
  }, [])
  return (
    <>
      <OrbitControls object-position={[0, 0, 30]} enablePan={true} makeDefault></OrbitControls>

      <mesh
        onClick={(ev) => {
          arr.push(ev.point.toArray())
          console.log(arr)
        }}
        visible={true}
        position={[0, 0, -3]}
        scale={[1, 1, 1]}>
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

      <group position={[0, 0, 0]}>
        {controls &&
          video &&
          handLandmarkResult &&
          handLandmarkResult.map((hand, handIDX) => {
            return (
              hand
                // .filter((f, fi) => fi === 4)
                .map((finger, fingerIDX) => {
                  if (!(fingerIDX === 8 || fingerIDX === 4)) {
                    return null
                  }

                  return <Hand key={fingerIDX} handIDX={handIDX} fingerIDX={fingerIDX} vp={vp} hand={hand}></Hand>
                })
            )
          })}
      </group>

      {/*  */}
    </>
  )
}

function Hand({ hand, vp, handIDX, fingerIDX }) {
  let v1 = useMemo(() => new Vector3(), [])
  let v2 = useMemo(() => new Vector3(), [])
  let middle = useMemo(() => new Vector3(), [])
  let fVec = useMemo(() => new Vector3(), [])

  let spin = useRef(0)

  middle.copy(v1)
  middle.lerp(v2, 0.5)

  let dist = v1.distanceTo(v2)

  if (dist >= 0.3141592) {
    dist = 0.3141592
  }

  dist = 0.3141592 - dist

  v1.lerp(hand[8], 1)
  v2.lerp(hand[4], 1)

  spin.current = MathUtils.lerp(spin.current, dist, 0.05)

  fVec.copy(middle)

  return (
    <group
      key={`${handIDX}_${fingerIDX}`}
      position={[vp.width * fVec.x - vp.width * 0.5, vp.height * -fVec.y + vp.height * 0.5, fVec.z * 0.0]}
      scale={[1, 1, 1]}>
      {/* <Text scale={1} position={[0, 0, 1]} fontSize={0.3} color={'#ff0000'}>
                        {fingerIDX}
                      </Text> */}

      <group scale={(0.1 * Math.PI - spin.current) * 5.0} rotation={[0, 0, spin.current * Math.PI * 2.0 * -7.0]}>
        <Cone args={[1, 1, 3, 1]} scale={[0.5, 2, 0.5]} rotation={[0, 0, Math.PI * -0.5]} position={[0, 2, 0]}>
          <meshPhysicalMaterial
            thickness={5}
            roughness={0}
            transmission={(0.1 * Math.PI - spin.current) * 5.0}></meshPhysicalMaterial>
        </Cone>
        <Cone args={[1, 1, 3, 1]} scale={[0.5, 2, 0.5]} rotation={[0, 0, Math.PI * 0.5]} position={[0, -2, 0]}>
          <meshPhysicalMaterial
            thickness={5}
            roughness={0}
            transmission={(0.1 * Math.PI - spin.current) * 5.0}></meshPhysicalMaterial>
        </Cone>
      </group>

      <group scale={1}>
        <Sphere args={[0.3, 32, 32]} scale={[3, 3, 1]}>
          <meshStandardMaterial
            roughness={1}
            transparent
            metalness={0}
            color={handIDX % 2 == 1.0 ? 'red' : 'lime'}></meshStandardMaterial>
        </Sphere>
      </group>

      {handIDX % 2 == 0.0 && (
        <>
          {/* <group
            userData={{
              forceSize: 5,
              forceTwist: 5,
              forceType: 'vortexZ',
              type: 'ForceField',
            }}></group> */}
          <group
            userData={{
              forceSize: -3.5,
              forceTwist: 5,
              forceType: 'attract',
              type: 'ForceField',
            }}></group>
        </>
      )}

      {handIDX % 2 == 1.0 && (
        <>
          <group
            userData={{
              forceSize: -3.5,
              forceTwist: 5,
              forceType: 'attract',
              type: 'ForceField',
            }}></group>
        </>
      )}
    </group>
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
        // /**
        //  * The minimum confidence score for the hand detection to be considered
        //  * successful. Defaults to 0.5.
        //  */
        // minHandDetectionConfidence: 0.4,
        // /**
        //  * The minimum confidence score of hand presence score in the hand landmark
        //  * detection. Defaults to 0.5.
        //  */
        // minHandPresenceConfidence: 0.4,
        // /**
        //  * The minimum confidence score for the hand tracking to be considered
        //  * successful. Defaults to 0.5.
        //  */
        // minTrackingConfidence: 0.4,
      })

      useFinger.setState({ handLandmarker })
    }

    tsk()
  }, [])

  let handLandmarker = useFinger((r) => r.handLandmarker)
  let video = useFinger((r) => r.video)

  // let handLandmarkResult = useFinger((r) => r.handLandmarkResult)
  useFrame(({}) => {
    if (handLandmarker && video) {
      const result = handLandmarker.detect(video)

      useFinger.setState({ handLandmarkResult: result.landmarks })
    }
  })

  //

  // let sizeHeight = useFinger((r) => r.sizeHeight)
  // let sizeWidth = useFinger((r) => r.sizeWidth)
  // let minSS = useFinger((r) => r.minSS)
  // let maxSS = useFinger((r) => r.maxSS)
  // let maxVP = useFinger((r) => r.maxVP)

  // let size = useThree((r) => r.size)
  // let vpg = useThree((r) => r.viewport)
  // let camera = useThree((r) => r.camera)
  // let vp = vpg.getCurrentViewport(camera, [0, 0, -1], size)

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
                    setTimeout(() => {
                      useFinger.setState({ noMenu: true, menuText: '', video, videoTexture })
                      setTimeout(() => {
                        window.dispatchEvent(new Event('resize'))
                      })
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
