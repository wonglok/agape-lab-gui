import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import { ParticleRelay } from './EnergyCollectionGame/ParticleEngine/CoreEngine'

export function NoodleCamera() {
  return (
    <>
      {/*  */}

      <Canvas>
        {/*  */}

        {/* <EffectComposer disableNormalPass resolutionScale={0.35}>
          <Bloom intensity={1} mipmapBlur luminanceThreshold={0.5} resolutionScale={0.35}></Bloom>
        </EffectComposer> */}
        <CameraFinger></CameraFinger>

        <FingerDetection></FingerDetection>
        {/*  */}

        <OrbitControls object-position={[0, 0, 20]} enablePan={true} makeDefault></OrbitControls>
        <ParticleRelay />
      </Canvas>

      {<CameraMenu></CameraMenu>}

      {/*  */}
    </>
  )
}
