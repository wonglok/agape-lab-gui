import { GLBLoader } from '@/components/loader/GLBLoader'
import { Genesis } from '../Genesis/Genesis'

export function Garage() {
  return (
    <group>
      <GLBLoader
        decorate={({ glb }) => {
          return <primitive object={glb.scene}></primitive>
        }}
        url={`/2022/03/19/ar/garage-6.glb`}>
        {({ glb }) => {
          //
          return <group></group>
        }}
      </GLBLoader>

      <group position={[0, 0, -4]}>
        <Genesis></Genesis>
      </group>
    </group>
  )
}
