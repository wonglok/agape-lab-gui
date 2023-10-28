import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'
// import { Bloom, EffectComposer } from '@react-three/postprocessing'
// import { OrbitControls } from '@react-three/drei'
// import { ParticleRelay } from './EnergyCollectionGame/ParticleEngine/CoreEngine'

import {
  Box,
  Circle,
  Environment,
  MeshDiscardMaterial,
  OrbitControls,
  Plane,
  Sphere,
  useGLTF,
  useTexture,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { getWaterSim } from './getWaterSim'
import { Object3D, Vector3, sRGBEncoding } from 'three'

export function CleanRobot() {
  let mouse3d = new Object3D()
  return (
    <>
      {/*  */}

      <Canvas
        onCreated={(st) => {
          st.gl.domElement.ontouchstart = (ev) => {
            ev.preventDefault()
          }
          st.gl.domElement.ontouchmove = (ev) => {
            ev.preventDefault()
          }
        }}>
        <group scale={[-1, 1, 1]}>
          <CameraFinger></CameraFinger>
          <FingerDetection></FingerDetection>

          <Suspense fallback={null}>
            <Wall></Wall>
          </Suspense>
          {/* <ParticleRelay /> */}

          <WaterSurfaceContent></WaterSurfaceContent>
          <Environment path={''} background files={`/lok/street.hdr`}></Environment>
        </group>

        {/* <EffectComposer>
          <Bloom luminanceThreshold={0.2}></Bloom>
        </EffectComposer> */}
      </Canvas>

      <CameraMenu></CameraMenu>

      {/*  */}
    </>
  )
}
function Wall() {
  let glb = useGLTF(`/winframe/framewin.glb`)

  return <primitive object={glb.scene}></primitive>
}
export function WaterSurfaceContent() {
  let WIDTH = 128
  let gl = useThree((it) => it.gl)
  let [api, setAPI] = useState(null)
  useEffect(() => {
    if (!gl) {
      return
    }

    let api = getWaterSim({ renderer: gl, WIDTH })

    setAPI(api)
  }, [gl, WIDTH])

  useFrame(() => {
    if (!api) {
      return
    }

    //
  })

  // let bgMap = useTexture(`/envMap/ma-galaxy.jpg`)
  // bgMap.encoding = sRGBEncoding

  // let viewport = useThree((r) => r.viewport)
  // let ww = Math.min(viewport.width, viewport.height)
  let ww = 60
  let hh = 60

  // useEffect(() => {
  //   let faceWall = new Vector3(0, 0, -1).normalize()
  //   window.addEventListener('hand', ({ detail: { position } }) => {
  //     // console.log(position)

  //     destination.copy(position)
  //     destination.x *= -1
  //     raycaster.set(position, faceWall)

  //     if (raytarget.current) {
  //       raycaster.intersectObject(raytarget.current).forEach((it) => {
  //         it.uv.addScalar(-0.5)
  //         uvLerp.copy(it.uv)
  //         uvLerp.z = 0
  //       })
  //     }
  //   })
  // }, [])

  return (
    <>
      {api && (
        <>
          <CleanBot3D api={api} ww={ww} hh={hh}></CleanBot3D>
          <Box
            position={[0, 0, -1]}
            rotation={[0, 0, 0]}
            args={[ww, hh, 0.1, WIDTH, WIDTH, 1]}
            // args={[7 / 2, 32]}
            material={api.displayMaterial}></Box>
        </>
      )}

      {/* <OrbitControls object-position={[0, 0, 15]}></OrbitControls> */}
    </>
  )
}

function CleanBot3D({ api, ww }) {
  let glb = useGLTF(`/expcenter/WindowWasher-rescale-v1.glb`)
  //

  let uvLerp = useMemo(() => {
    return new Vector3(10000, 100000, 10000)
  }, [])
  let destination = useMemo(() => {
    return new Vector3()
  }, [])
  let raytarget = useRef()
  let raycaster = useThree((r) => {
    return r.raycaster
  })

  let groupRef = useRef()
  let delta = new Vector3()

  useEffect(() => {
    window.addEventListener('hand', ({ detail: { position } }) => {
      // console.log(position)

      destination.copy(position)
      destination.x *= -1
    })
  }, [api, destination, raycaster, uvLerp])

  useFrame(() => {
    api.compute()
    api.updateMaterial()
    api.updateMouse(uvLerp.x, uvLerp.y, uvLerp.z)
  })
  let faceWall = new Vector3(0, 0, -1).normalize()

  useFrame((st, dt) => {
    if (glb) {
      delta.copy(destination).sub(groupRef.current.position).normalize()

      delta.z = 0
      if (destination.distanceTo(groupRef.current.position) >= 0.5) {
        groupRef.current.position.addScaledVector(delta, 10.0 * dt)
      }

      groupRef.current.position.z = 1
      groupRef.current.lookAt(-destination.x, destination.y, 1)
      groupRef.current.rotation.x = Math.PI * 0.5
      groupRef.current.rotation.z = 0

      if (groupRef?.current?.position) {
        groupRef.current.position.z = 1
        raycaster.set(groupRef.current.position, faceWall)

        if (raytarget.current) {
          raycaster.intersectObject(raytarget.current).forEach((it) => {
            it.uv.addScalar(-0.5)
            uvLerp.x = -it.uv.x
            uvLerp.y = it.uv.y
            uvLerp.z = 0
          })
        }
      }
    }
  })
  //
  return (
    <>
      <Box
        ref={raytarget}
        // onPointerMove={(ev) => {
        //   if (api) {
        //     ev.uv.addScalar(-0.5)
        //     uvLerp.copy(ev.uv)
        //   }
        // }}
        // onPointerDown={(ev) => {
        //   if (api) {
        //     ev.uv.addScalar(-0.5)
        //     uvLerp.copy(ev.uv)
        //   }
        // }}
        // onPointerLeave={(ev) => {
        //   if (api) {
        //     api.updateMouse(10000, 10000)
        //     uvLerp.set(10000, 10000)
        //   }
        // }}
        args={[ww, ww, 0.1, 1, 1, 1]}
        position={[0, 0, 0]}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>
      <group ref={groupRef}>
        <group scale={3} rotation={[Math.PI * 0.5 * 0.0, 0, 0]}>
          <primitive object={glb.scene}></primitive>
        </group>
      </group>
    </>
  )
}
