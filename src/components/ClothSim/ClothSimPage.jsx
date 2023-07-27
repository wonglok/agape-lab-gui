import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { ClothSim } from './ClothSim'

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
  //
  let scene = useThree((state) => state.scene)
  scene.backgroundBlurriness = 0
  scene.backgroundIntensity = 2.5
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 350]}></PerspectiveCamera>
      <Environment files={`/lok/street.hdr`} background />

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 1]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 2]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 3]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 4]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 5]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 6) * 6]}>
        <group scale={[1, 1, 1]} position={[130, 0, 0]} rotation={[-0.25, 0, 0]}>
          <ClothSim></ClothSim>
        </group>
      </group>
    </>
  )
}
