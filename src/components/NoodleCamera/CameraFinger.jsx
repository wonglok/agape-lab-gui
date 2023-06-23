import { AdditiveBlending, Object3D, Vector3, VideoTexture, sRGBEncoding } from 'three'
import { useFinger } from './useFinger'
import { useFrame, useThree } from '@react-three/fiber'
import { Box, OrthographicCamera, useGLTF } from '@react-three/drei'
import { use, useEffect, useMemo, useRef } from 'react'
import { CCDIKSolver, CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver'

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
          position={[0, 0, 250]}
          near={1}
          far={maxSS}
          top={size.height / 2}
          right={size.width / 2}
          bottom={size.height / -2}
          left={size.width / -2}
          makeDefault></OrthographicCamera>
      )}

      {videoTexture && (
        <>
          <mesh position={[0, 0, -100]} scale={[1, 1, 1]}>
            <planeGeometry args={[maxSS, maxSS]}></planeGeometry>
            <meshBasicMaterial
              depthWrite={true}
              opacity={1}
              depthTest={true}
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

  let handLandmarkResult = useFinger((r) => r.handLandmarkResult)
  useFrame(({ viewport }) => {
    if (handLandmarker && video) {
      const result = handLandmarker.detect(video)

      useFinger.setState({ handLandmarkResult: result.landmarks })
    }
  })

  let sizeHeight = useFinger((r) => r.sizeHeight)
  let sizeWidth = useFinger((r) => r.sizeWidth)
  let minSS = useFinger((r) => r.minSS)
  let maxSS = useFinger((r) => r.maxSS)

  return (
    <>
      {video && handLandmarkResult && <Hand></Hand>}
      {video &&
        handLandmarkResult &&
        handLandmarkResult.map((hand, handIDX) => {
          return hand.map((finger, fingerIDX) => {
            return (
              <group
                key={`${handIDX}_${fingerIDX}`}
                position={[maxSS * finger.x - maxSS * 0.5, maxSS * -finger.y + maxSS * 0.5, finger.z * 1.0]}
                scale={[1, 1, 1]}>
                <Box scale={[30, 30, 30]}>
                  <meshBasicMaterial color={'#ff0000'}></meshBasicMaterial>
                </Box>
              </group>
            )
          })
        })}
    </>
  )
}

function Hand() {
  let handLandmarkResult = useFinger((r) => r.handLandmarkResult)
  let glb = useGLTF(`/finger/hand.glb`)

  const OOI = useMemo(() => {
    let OOI = {
      MyRoot: new Object3D(),
    }

    glb.scene.traverse((n) => {
      console.log(n.name)
      if (n.name === 'palm_') OOI.PALM = n
      if (n.name === 'Bone') OOI.Bone = n
      if (n.name === 'Bone001') OOI.ring0 = n
      if (n.name === 'Bone011') OOI.ring1 = n
      if (n.name === 'Bone012') OOI.ring2 = n
      if (n.name === 'Bone013') OOI.ring3 = n

      if (n.name === 'Bone002') OOI.middle0 = n
      if (n.name === 'Bone008') OOI.middle1 = n
      if (n.name === 'Bone009') OOI.middle2 = n
      if (n.name === 'Bone010') OOI.middle3 = n

      if (n.name === 'Bone003') OOI.index0 = n
      if (n.name === 'Bone005') OOI.index1 = n
      if (n.name === 'Bone006') OOI.index2 = n
      if (n.name === 'Bone007') OOI.index3 = n

      if (n.name === 'Bone004') OOI.pinky0 = n
      if (n.name === 'Bone014') OOI.pinky1 = n
      if (n.name === 'Bone015') OOI.pinky2 = n
      if (n.name === 'Bone016') OOI.pinky3 = n

      if (n.name === 'Bone017') OOI.thumb0 = n
      if (n.name === 'Bone018') OOI.thumb1 = n
      if (n.name === 'Bone019') OOI.thumb2 = n
    })

    return OOI
  }, [glb])

  const { IKSolver, ccdikhelper } = useMemo(() => {
    let skinnedMesh = OOI.PALM
    const iks = [
      {
        target: skinnedMesh.skeleton.bones.findIndex((r) => r.name === OOI['ring3'].name), // "target_hand_l"
        effector: skinnedMesh.skeleton.bones.findIndex((r) => r.name === OOI['ring2'].name), // "hand_l"
        links: [
          {
            index: skinnedMesh.skeleton.bones.findIndex((r) => r.name === OOI['ring1'].name), // "lowerarm_l"
          },
          {
            index: skinnedMesh.skeleton.bones.findIndex((r) => r.name === OOI['ring0'].name), // "lowerarm_l"
          },
          {
            index: skinnedMesh.skeleton.bones.findIndex((r) => r.name === OOI['Bone'].name), // "lowerarm_l"
          },
        ],
      },
    ]

    const ccdikhelper = new CCDIKHelper(OOI.PALM, iks, 0.01)

    return {
      IKSolver: new CCDIKSolver(OOI.PALM, iks),
      ccdikhelper: ccdikhelper,
    }
  }, [OOI])

  let gp = useRef()
  let maxSS = useFinger((r) => r.maxSS)
  let getPos = (finger) => [maxSS * finger.x - maxSS * 0.5, maxSS * -finger.y + maxSS * 0.5, finger.z * 1.0]

  useFrame(() => {
    if (IKSolver && handLandmarkResult && handLandmarkResult.length > 0) {
      // let root = new Vector3().fromArray(getPos(handLandmarkResult[0][0]))
      // let target = new Vector3().fromArray(getPos(handLandmarkResult[0][8]))

      // OOI.PALM.position.lerp(root, 0.101)
      // // glb.scene.position.lerp(root, 1)
      // OOI.ring3.position.lerp(target, 0.1)
      IKSolver.update()
    }
  })

  return (
    <>
      <primitive object={ccdikhelper}></primitive>
      <group ref={gp} position={[0, 0, 0]}>
        {handLandmarkResult[0] && <group position={getPos(handLandmarkResult[0][0])}></group>}
      </group>
      <group scale={50}>
        <primitive object={glb.scene}></primitive>
      </group>
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
