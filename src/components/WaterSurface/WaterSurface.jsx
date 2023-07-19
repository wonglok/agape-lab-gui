import { Box, Circle, Environment, OrbitControls, Plane, Sphere, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getWaterSim } from './getWaterSim'
import { MeshPhysicalMaterial, Vector3 } from 'three'
import { Vector2 } from 'three147'

export function WaterSurface({}) {
  return (
    <>
      <Canvas>
        <Content></Content>
      </Canvas>
      {/*  */}

      {/*  */}
    </>
  )
}

function Content() {
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

  let bgMap = useTexture(`/pattern/square-agape.png`)
  return (
    <>
      <Box args={[7, 7, 0.1, WIDTH - 1, WIDTH - 1, 1]} position={[0, 0, -0.5]}>
        <meshStandardMaterial map={bgMap}></meshStandardMaterial>
      </Box>
      {api && (
        <Box
          rotation={[0, 0, 0]}
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
          args={[7, 7, 0.1, WIDTH - 1, WIDTH - 1, 1]}
          // args={[7 / 2, 32]}
          material={api.displayMaterial}></Box>
      )}

      <OrbitControls position={[0, 0, 10]}></OrbitControls>
      <Environment background files={`/lok/shanghai.hdr`}></Environment>
    </>
  )
}
