import { Box, Environment, MeshDiscardMaterial, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ClothSim } from './ClothSim'
import { Vector3 } from 'three'
import { useMemo, useRef } from 'react'

export function ClothSimPage({}) {
  return (
    <>
      <Canvas>
        {/* <OrbitControls object-position={[0, 0, 200]}></OrbitControls> */}
        <Content></Content>
      </Canvas>

      {/*  */}
    </>
  )
}

function Content() {
  let sharedPoint = useMemo(() => {
    return new Vector3(0, -100, 200)
  }, [])
  //
  let scene = useThree((state) => state.scene)
  scene.backgroundBlurriness = 0
  scene.backgroundIntensity = 2.5

  let array = []

  let max = 10
  for (let i = 0; i < max; i++) {
    array.push(
      <group key={i + 'ball'} scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / max) * i]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
          <ClothSim idx={i} sharedPoint={sharedPoint}></ClothSim>
        </group>
      </group>,
    )
  }
  let spin = useRef()
  useFrame((st, dt) => {
    if (spin.current) {
      spin.current.rotation.z += dt * 0.3
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 350]}></PerspectiveCamera>
      <Environment files={`/lok/street.hdr`} background />
      <group ref={spin} rotation={[0, 0, 0]}>
        {/* <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 1]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={0} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 2]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={1} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 3]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={2} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 4]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={3} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 5]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={4} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 6]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={5} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group>

        <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * 7]}>
          <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.65, 0, -0.5]}>
            <ClothSim idx={6} sharedPoint={sharedPoint}></ClothSim>
          </group>
        </group> */}
        {array}
      </group>

      <Controls sharedPoint={sharedPoint}></Controls>
    </>
  )
}

function Controls({ sharedPoint }) {
  let point = sharedPoint
  return (
    <>
      <Box
        //
        rotation={[0, 0, 0]}
        onPointerMove={(ev) => {
          if (ev.object) {
            // console.log(ev.point.x, ev.point.y, ev.point.z)
            point.copy(ev.point) //.addScaledVector(ev.face.normal, 0)
          }
        }}
        onPointerDown={(ev) => {
          // console.log(ev.point.x, ev.point.y, ev.point.z)

          if (ev.object) {
            point.copy(ev.point) //.addScaledVector(ev.face.normal, 0)
          }
          // point.copy(ev.point)
        }}
        position={[0, 0, 5]}
        args={[200, 200]}
        scale={2}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>
    </>
  )
}
