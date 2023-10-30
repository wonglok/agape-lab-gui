import { Environment, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { ClothSim } from './ClothSim'

export function ClothSimAvatar({}) {
  return (
    <>
      <Canvas>
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
      <Environment path={'https://lab.agape.land'} files={`/lok/street.hdr`} background />
      <ClothSim></ClothSim>
    </>
  )
}
