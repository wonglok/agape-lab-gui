import { Canvas } from '@react-three/fiber'
import { CameraFinger, CameraMenu, FingerDetection } from './CameraFinger'

export function NoodleCamera() {
  return (
    <>
      {/*  */}

      <Canvas>
        {/*  */}

        <CameraFinger></CameraFinger>

        <FingerDetection></FingerDetection>
        {/*  */}
      </Canvas>

      {<CameraMenu></CameraMenu>}

      {/*  */}
    </>
  )
}
