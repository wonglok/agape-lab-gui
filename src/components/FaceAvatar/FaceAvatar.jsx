import { Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, DoubleSide, MathUtils, Matrix4, Object3D, Quaternion } from 'three'
import { AnimationMixer } from 'three147'
import { create } from 'zustand'

let running = async ({ onLoop, setList = () => {}, setData = () => {} }) => {
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
    numFaces: 7,
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

      onLoop(async () => {
        let ts = performance.now()
        let results = faceLandmarker.detectForVideo(video, ts)

        let faceBlendshapes = results.faceBlendshapes
        let faceMatrix = results.facialTransformationMatrixes

        let count = faceMatrix.length
        let list = []

        for (let i = 0; i < count; i++) {
          let fristMatrix = faceMatrix[i]
          let firstFace = faceBlendshapes[i]

          if (firstFace && fristMatrix) {
            let m4 = new Matrix4()
            let o3d = new Object3D()
            m4.fromArray(fristMatrix.data)
            m4.decompose(o3d.position, o3d.quaternion, o3d.scale)

            if (i === 0) {
              setData({
                video,
                morphTargets: firstFace.categories,
                o3d: o3d,
              })
            }

            list.push({
              i,
              order: o3d.position.x,
              morphTargets: firstFace.categories,
              o3d: o3d,
              ts: performance.now(),
            })
          }
        }

        list = list.slice()
        list = list.sort((a, b) => {
          if (a.order > b.order) {
            return 1
          }
          if (a.order < b.order) {
            return -1
          }
          return 0
        })

        setList({
          //
          list,

          //
        })
      })
    }
  })
}

export function FaceAvatarCore({ onList = () => {}, onData = () => {} }) {
  useEffect(() => {
    let works = []
    let onLoop = (v) => {
      works.push(v)
    }

    running({
      onLoop,
      setList: onList,
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
  }, [onData, onList])

  return <>{/*  */}</>
}

const useFaceAvatar = create(() => {
  return {
    list: [],
    morphTargets: [],
    o3d: new Object3D(),
    video: null,
  }
})

export function FaceAvatar() {
  let onData = useCallback(({ morphTargets, o3d, video }) => {
    useFaceAvatar.setState({ morphTargets, o3d, video })
  }, [])

  let onList = useCallback(({ list }) => {
    //

    list.forEach((r, i, a) => {
      useFaceAvatar.getState().list[i] = r
    })

    useFaceAvatar.getState().list.forEach((old, i, a) => {
      if (old && Math.abs(performance.now() - old.ts) >= 10 * 1000) {
        useFaceAvatar.getState().list[i] = false
      } else {
      }
    })

    useFaceAvatar.setState({ list: [...useFaceAvatar.getState().list].filter((r) => r) })
  }, [])

  let morphTargets = useFaceAvatar((s) => s.morphTargets)

  return (
    <>
      <FaceAvatarCore onList={onList} onData={onData} />
      <Canvas>
        <Content></Content>
      </Canvas>
      <div className=' absolute top-0 right-0'>
        <VideoYo></VideoYo>
      </div>
      <div className='absolute top-0 left-0 h-full p-3 overflow-scroll'>
        {morphTargets.map((r, i) => {
          return (
            <div key={i} className='bg-gray-200 bg-opacity-75' style={{ width: `calc(100% * ${r.score})` }}>
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
  return <div className='w-48 h-48 opacity-80' ref={ref}></div>
}

function Content() {
  let origin = (typeof window !== 'undefined' && window.location.origin) || false
  let list = useFaceAvatar((s) => s.list) || []
  return (
    <group>
      <PerspectiveCamera makeDefault position={[0, 1.67, 0.6]}></PerspectiveCamera>
      <OrbitControls makeDefault target={[0, 1.67, 0]}></OrbitControls>
      <group rotation={[0, 0, 0]}>
        {/* <Avatar rotation={[0, 0.3, 0]} position={[-0.15, 0, 0]}></Avatar> */}
        {list.map((li, lidx) => {
          if (!li) {
            return null
          }
          let sep = 0.5
          return (
            <group rotation={[0, -0.5, 0]} key={'face' + lidx}>
              <AvatarCore
                rotation={[0, -Math.PI * 0.25, 0]}
                morphTargets={li.morphTargets}
                o3d={li.o3d}
                position={[lidx * sep - (list.filter((r) => r).length - 1) * 0.5 * sep, 0, 0]}
                url={`/FaceAvatar/avatar/face.glb?i=${lidx}`}></AvatarCore>
            </group>
          )
        })}
      </group>
      {origin && <Environment path={origin} files={`/lok/shanghai.hdr`}></Environment>}
    </group>
  )
}

function AvatarCore({ url = `/FaceAvatar/avatar/stand.glb`, morphTargets, o3d, ...props }) {
  // let glb = useGLTF(`/FaceAvatar/avatar/face.glb`)
  let glb = useGLTF(url)
  // let morphTargets = useFaceAvatar((s) => s.morphTargets)
  // let o3d = useFaceAvatar((s) => s.o3d)
  //
  let mixer = useMemo(() => {
    return new AnimationMixer(glb.scene)
  }, [glb.scene])

  useFrame((st, dt) => {
    mixer.update(dt)
  })

  useEffect(() => {
    glb.animations.forEach((r) => {
      mixer.clipAction(r).play()
    })
  }, [glb, mixer])

  useFrame((st, dt) => {
    glb.scene.traverse((r) => {
      if (r?.material) {
        r.material.side = DoubleSide
      }
      if (r.isBone && r.name === 'Head') {
        r.quaternion.slerp(o3d.quaternion, 0.2)
        r.rotation.x = -0.25
        r.rotation.z *= -0.5
        r.scale.copy(o3d.scale)
      }
      if (r.geometry && r.morphTargetDictionary && r.morphTargetInfluences) {
        // morphTargets.find((r) => r.categoryName === 'mouthFunnel').score
        // mouthSmileLeft

        // console.log(r.morphTargetDictionary)

        for (let kn in r.morphTargetDictionary) {
          let foundTarget = morphTargets.find((r) => r.categoryName === kn)
          if (foundTarget) {
            let fromVal = r.morphTargetInfluences[r.morphTargetDictionary[kn]]
            let toVal = foundTarget.score

            r.morphTargetInfluences[r.morphTargetDictionary[kn]] = MathUtils.lerp(fromVal, toVal, 0.9)

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
    <group {...props}>
      <primitive object={glb.scene}></primitive>
      {/* 
      <directionalLight
        position={[0, 1, 1]}
        target-position={[0, 1.5, 0]}
        color={'#bababa'}
        intensity={0.5}></directionalLight> */}
    </group>
  )
}
