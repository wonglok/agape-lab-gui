import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import { ParticleRelay } from './EnergyCollectionGame/ParticleEngine/CoreEngine'

export function NoodleCamera() {
  return (
    <>
      {/*  */}

      <Canvas
        onCreated={(st) => {
          st.gl.domElement.ontouchstart = (ev) => {
            ev.preventDefault()
          }
          st.gl.domElement.ontouchmove = (ev) => {
            ev.preventDefault()
          }
        }}>
        <CameraFinger></CameraFinger>

        <FingerDetection></FingerDetection>

        <ParticleRelay />
      </Canvas>

      <CameraMenu></CameraMenu>

      {/*  */}
    </>
  )
}
