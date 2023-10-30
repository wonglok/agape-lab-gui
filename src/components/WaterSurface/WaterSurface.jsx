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
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getWaterSim } from './getWaterSim'
import { Vector3, sRGBEncoding } from 'three'

export function WaterSurface({}) {
  return (
    <>
      <Canvas>
        <WaterSurfaceContent></WaterSurfaceContent>
        <Environment path={'https://lab.agape.land'} background files={`/lok/street.hdr`}></Environment>
      </Canvas>
      {/*  */}

      {/*  */}
    </>
  )
}

export function WaterSurfaceContent() {
  let WIDTH = 256
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

  let bgMap = useTexture(`/envMap/ma-galaxy.jpg`)
  bgMap.encoding = sRGBEncoding

  let viewport = useThree((r) => r.viewport)
  let ww = Math.min(viewport.width, viewport.height)
  return (
    <>
      <Box
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
        position={[0, 0, 0]}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>

      {api && (
        <Box
          rotation={[0, 0, 0]}
          args={[ww, ww, 0.1, WIDTH, WIDTH, 1]}
          // args={[7 / 2, 32]}
          material={api.displayMaterial}></Box>
      )}

      {/* <OrbitControls object-position={[0, 0, 15]}></OrbitControls> */}
    </>
  )
}
