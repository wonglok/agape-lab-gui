import { Box, Environment, OrbitControls, Plane } from '@react-three/drei'
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
    return new Vector3()
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

  return (
    <>
      {api && (
        <Plane
          rotation={[0, 0, 0]}
          onPointerMove={(ev) => {
            // let newPt = ev.object.worldToLocal(ev.point).multiplyScalar(1)

            // if (api) {
            //   api.updateMouse(newPt.x, newPt.y, newPt.z)
            // }

            if (api) {
              ev.uv.addScalar(-0.5)
              uvLerp.copy(ev.uv)
              // console.log(ev.uv)
            }
          }}
          onPointerLeave={(ev) => {
            if (api) {
              api.updateMouse(10000, 10000)
              uvLerp.set(10000, 10000)
            }
          }}
          args={[5, 5, WIDTH, WIDTH]}
          material={api.displayMaterial}></Plane>
      )}

      <OrbitControls position={[0, 0, 10]}></OrbitControls>
      <Environment files={`/lok/shanghai.hdr`}></Environment>
    </>
  )
}
