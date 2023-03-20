import { GLBLoader } from '@/components/loader/GLBLoader'
import { Genesis } from '../Genesis/Genesis'

export function Garage() {
  return (
    <group>
      <GLBLoader
        decorate={({ glb }) => {
          glb.scene.traverse((it) => {
            //

            if (it.material) {
              it.castShadow = true
              it.receivesShadow = true
              it.material.envMapIntensity = 0.1
            }
          })
          return <primitive object={glb.scene}></primitive>
        }}
        url={`/2022/03/19/ar/garage-6.glb`}></GLBLoader>

      <pointLight castShadow={true} position={[0, 1, 0]} />

      <group position={[0, 0.1, -4]}>
        <Genesis></Genesis>
      </group>
    </group>
  )
}
