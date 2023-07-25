import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'
// import { Bloom, EffectComposer } from '@react-three/postprocessing'
// import { OrbitControls } from '@react-three/drei'
import { ParticleRelay } from './EnergyCollectionGame/ParticleEngine/CoreEngine'

import {
  Box,
  Circle,
  Environment,
  MeshDiscardMaterial,
  OrbitControls,
  Plane,
  Sphere,
  useTexture,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
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

          {/* <ParticleRelay /> */}

          <WaterSurfaceContent></WaterSurfaceContent>
          <Environment background files={`/lok/street.hdr`}></Environment>
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

  let uvLerp = useMemo(() => {
    return new Vector3(10000, 100000, 10000)
  }, [])

  useFrame(() => {
    if (!api) {
      return
    }

    api.compute()
    api.updateMaterial()
    api.updateMouse(uvLerp.x, uvLerp.y)
    //
  })

  // let bgMap = useTexture(`/envMap/ma-galaxy.jpg`)
  // bgMap.encoding = sRGBEncoding

  // let viewport = useThree((r) => r.viewport)
  // let ww = Math.min(viewport.width, viewport.height)
  let ww = 60
  let hh = 60

  let raycaster = useThree((r) => {
    return r.raycaster
  })
  let raytarget = useRef()
  useEffect(() => {
    let faceWall = new Vector3(0, 0, -1).normalize()
    window.addEventListener('hand', ({ detail: { position } }) => {
      console.log(position)

      raycaster.set(position, faceWall)

      if (raytarget.current) {
        raycaster.intersectObject(raytarget.current).forEach((it) => {
          it.uv.addScalar(-0.5)
          uvLerp.copy(it.uv)
          uvLerp.z = 0
        })
      }
    })
  }, [])
  return (
    <>
      <Box
        ref={raytarget}
        onPointerMove={(ev) => {
          if (api) {
            ev.uv.addScalar(-0.5)
            uvLerp.copy(ev.uv)
          }
        }}
        onPointerLeave={(ev) => {
          if (api) {
            api.updateMouse(10000, 10000)
            uvLerp.set(10000, 10000)
          }
        }}
        args={[ww, ww, 0.1, 1, 1, 1]}
        position={[0, 0, -1]}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>

      {api && (
        <Box
          position={[0, 0, -1]}
          rotation={[0, 0, 0]}
          args={[ww, hh, 0.1, WIDTH, WIDTH, 1]}
          // args={[7 / 2, 32]}
          material={api.displayMaterial}></Box>
      )}

      {/* <OrbitControls object-position={[0, 0, 15]}></OrbitControls> */}
    </>
  )
}
