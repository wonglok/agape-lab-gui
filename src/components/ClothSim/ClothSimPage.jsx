import { Box, Environment, OrbitControls, Plane, Sphere } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ClothSim } from './ClothSim'

export function ClothSimPage({}) {
  return (
    <>
      <Canvas>
        <OrbitControls object-position={[0, 0, 200]}></OrbitControls>
        <Content></Content>
      </Canvas>
      {/*  */}

      {/*  */}
    </>
  )
}

function Content() {
  //
  return (
    <>
      <Environment files={`/lok/street.hdr`} background />
      <ClothSim></ClothSim>
    </>
  )
}
