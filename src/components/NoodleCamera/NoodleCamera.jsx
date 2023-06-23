import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'
import { EnergyCollectionGame } from './EnergyCollectionGame/EnergyCollectionGame'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

export function NoodleCamera() {
  return (
    <>
      {/*  */}

      <Canvas>
        {/*  */}

        <EffectComposer disableNormalPass resolutionScale={0.35}>
          <Bloom intensity={1} mipmapBlur luminanceThreshold={0.5} resolutionScale={0.35}></Bloom>
        </EffectComposer>
        <CameraFinger></CameraFinger>

        <FingerDetection></FingerDetection>
        {/*  */}

        <EnergyCollectionGame></EnergyCollectionGame>
      </Canvas>

      {<CameraMenu></CameraMenu>}

      {/*  */}
    </>
  )
}
