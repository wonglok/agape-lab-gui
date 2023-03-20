import { useAnimations, useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
import { Color } from 'three'

export function Genesis() {
  let gltf = useGLTF(`/2022/03/19/mech/texture-proper-512.glb`)

  let cloned = clone(gltf.scene)

  let anim = useAnimations([...gltf.animations], cloned)

  useEffect(() => {
    cloned.traverse((it) => {
      it.frustumCulled = false

      if (it.material) {
        it.material.envMapIntensity = 1
      }
      if (it.name === 'RetopoFlow005') {
        it.material.emissive = new Color('#00ffff')
      }
    })
  })

  useEffect(() => {
    if (!anim.actions.Idle) {
      return
    }

    anim.actions.Idle.play()
  }, [anim.actions.Idle])
  return (
    <>
      <group scale={3}>
        <pointLight position={[0, 1, 0]} />
        <primitive object={cloned}></primitive>
      </group>
    </>
  )
}
