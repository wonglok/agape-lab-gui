import { GLBLoader } from '@/components/loader/GLBLoader'
import { WorldBirdy } from '@/components/worldbirdy/WorldBirdy'
import { Box, Sphere } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
export default function Fun() {
  return (
    <div className='flex w-full h-full'>
      <Canvas>
        {/*  */}
        <Sphere></Sphere>

        <GLBLoader
          url={`/2022/03/18/floor/floor.glb`}
          decorate={({ glb }) => {
            let sceneCloned = clone(glb.scene)
            return <primitive object={sceneCloned}></primitive>
          }}></GLBLoader>
        {/*  */}

        <WorldBirdy></WorldBirdy>
      </Canvas>
    </div>
  )
}
