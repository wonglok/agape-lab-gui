import { Box, Environment, OrbitControls, PerspectiveCamera, Plane, Sphere } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ClothSim } from './ClothSim'

export function ClothSimPage({}) {
  return (
    <>
      <Canvas>
        {/* <OrbitControls object-position={[0, 0, 200]}></OrbitControls> */}
        <Content></Content>
      </Canvas>
      {/*  */}

      {/*  */}
    </>
  )
}

function Content() {
  //
  let scene = useThree((state) => state.scene)
  scene.backgroundBlurriness = 0
  scene.backgroundIntensity = 2.5
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 350]}></PerspectiveCamera>
      <Environment files={`/lok/street.hdr`} background />
      <ClothSim></ClothSim>
    </>
  )
}
