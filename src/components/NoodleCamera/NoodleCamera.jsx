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

        <CameraFinger></CameraFinger>

        <FingerDetection></FingerDetection>

        <OrbitControls object-position={[0, 0, 15]} enablePan={true} makeDefault></OrbitControls>
        <ParticleRelay />
      </Canvas>

      {<CameraMenu></CameraMenu>}

      {/*  */}
    </>
  )
}