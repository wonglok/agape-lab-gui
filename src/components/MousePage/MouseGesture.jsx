import { Environment } from '@react-three/drei'
import { useMouse } from './useMouse.js'
export function MouseGesture() {
  let videoTexture = useMouse((r) => r.videoTexture)

  if (videoTexture) {
  }
  return (
    <>
      <group>
        {videoTexture && (
          <mesh>
            <meshStandardMaterial map={videoTexture}></meshStandardMaterial>
            <planeBufferGeometry></planeBufferGeometry>
          </mesh>
        )}

        <Environment files={`/lok/shanghai.hdr`}></Environment>

        <directionalLight></directionalLight>
        <ambientLight></ambientLight>
        {/*  */}

        {/*  */}
      </group>
    </>
  )
}
