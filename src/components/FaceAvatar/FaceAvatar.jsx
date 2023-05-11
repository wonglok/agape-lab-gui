import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { use, useCallback, useEffect, useRef, useState } from 'react'
import { Clock, MathUtils, Matrix4, Object3D, Quaternion } from 'three'
import { create } from 'zustand'

let running = async ({ onLoop, setData = () => {} }) => {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision').then((r) => {
    return {
      FaceLandmarker: r.FaceLandmarker,
      FilesetResolver: r.FilesetResolver,
    }
  })

  const filesetResolver = await FilesetResolver.forVisionTasks(
    `/FaceAvatar/task-vision-wasm`,
    // 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
  )
  const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      modelAssetPath: `/FaceAvatar/face-landmark/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFacialTransformationMatrixes: true,
  })

  // const vision = await FilesetResolver.forVisionTasks(
  //   // `/FaceAvatar/task-vision-wasm`,
  //   'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  // )

  // const faceLandmarker = await FaceLandmarker.createFromModelPath(
  //   vision,
  //   // `/FaceAvatar/face-landmark/face_landmarker.task`,
  //   'https://storage.googleapis.com/mediapipe-tasks/face_landmarker/face_landmarker.task',
  // )

  const video = document.createElement('video')
  video.playsInline = true
  video.muted = true
  video.autoplay = true
  const mediaProm = navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', frameRate: 30, width: 640, height: 480 },
    audio: false,
  })

  await faceLandmarker.setOptions({
    runningMode: 'VIDEO',
  })

  mediaProm.then((stream) => {
    video.srcObject = stream
    video.onloadeddata = () => {
      //
      if (video.paused) {
        video.play()
      }
      let m4 = new Matrix4()
      let o3d = new Object3D()

      onLoop(async () => {
        let ts = performance.now()
        let results = faceLandmarker.detectForVideo(video, ts)

        let faceBlendshapes = results.faceBlendshapes

        let faceMatrix = results.facialTransformationMatrixes

        let fristMatrix = faceMatrix[0]
        let firstFace = faceBlendshapes[0]
        if (firstFace && fristMatrix) {
          m4.fromArray(fristMatrix.data)
          m4.decompose(o3d.position, o3d.quaternion, o3d.scale)

          setData({
            video,
            morphTargets: firstFace.categories,
            o3d: o3d,
          })
        }
      })
    }
  })
}

export function FaceAvatarCore({ onData = () => {} }) {
  useEffect(() => {
    let works = []
    let onLoop = (v) => {
      works.push(v)
    }
    running({
      onLoop,
      setData: onData,
    })

    let tt = 0
    let clock = new Clock()
    let rAF = () => {
      let dt = clock.getDelta()
      tt = requestAnimationFrame(rAF)
      works.forEach((r) => r(dt))
    }

    tt = requestAnimationFrame(rAF)
    return () => {
      works = []
      cancelAnimationFrame(tt)
    }
  }, [onData])

  return <>{/*  */}</>
}

const useFaceAvatar = create(() => {
  return {
    morphTargets: [],
    o3d: new Object3D(),
    video: null,
  }
})
export function FaceAvatar() {
  let onData = useCallback(({ morphTargets, o3d, video }) => {
    useFaceAvatar.setState({ morphTargets, o3d, video })
  }, [])
  let morphTargets = useFaceAvatar((s) => s.morphTargets)

  return (
    <>
      <FaceAvatarCore onData={onData} />
      <Canvas>
        <Content></Content>
      </Canvas>
      <div className=' absolute top-0 right-0'>
        <VideoYo></VideoYo>
      </div>
      <div className='absolute top-0 left-0 h-full p-3 overflow-scroll w-80'>
        {morphTargets.map((r, i) => {
          return (
            <div key={i} className='bg-gray-200' style={{ width: `calc(100% * ${r.score})` }}>
              {r.categoryName}
            </div>
          )
        })}
      </div>
    </>
  )
}

function VideoYo() {
  let ref = useRef()
  let video = useFaceAvatar((s) => s.video)

  useEffect(() => {
    if (!video) {
      return
    }
    ref.current.append(video)

    return () => {
      video.remove()
    }
  }, [video])
  return <div className=' w-96' ref={ref}></div>
}

function Content() {
  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 1.67, 0.6]}></PerspectiveCamera>
      <OrbitControls makeDefault target={[0, 1.67, 0]}></OrbitControls>
      <Avatar></Avatar>
      <Environment preset='sunset'></Environment>
    </group>
  )
}

function Avatar() {
  let glb = useGLTF(`/FaceAvatar/avatar/face.glb`)
  let morphTargets = useFaceAvatar((s) => s.morphTargets)

  useFrame((st, dt) => {
    glb.scene.traverse((r) => {
      if (r.geometry && r.morphTargetDictionary && r.morphTargetInfluences) {
        // morphTargets.find((r) => r.categoryName === 'mouthFunnel').score
        // mouthSmileLeft

        // console.log(r.morphTargetDictionary)

        for (let kn in r.morphTargetDictionary) {
          let foundTarget = morphTargets.find((r) => r.categoryName === kn)
          if (foundTarget) {
            let fromVal = r.morphTargetInfluences[r.morphTargetDictionary[kn]]
            let toVal = foundTarget.score

            r.morphTargetInfluences[r.morphTargetDictionary[kn]] = MathUtils.lerp(fromVal, toVal, 0.95)

            // MathUtils.damp(
            //   fromVal,
            //   toVal,
            //   1 * 150,
            //   dt,
            // )
          }
        }

        //r.morphTargetDictionary

        // let foundTarget = morphTargets.find((r) => r.categoryName === 'jawOpen')
        // if (foundTarget) {
        //   r.morphTargetInfluences[r.morphTargetDictionary['jawOpen']] = foundTarget.score
        // }
      }
    })
  })
  return (
    <group>
      <primitive object={glb.scene}></primitive>
    </group>
  )
}
