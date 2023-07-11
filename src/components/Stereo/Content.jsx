import { Box, Environment, MeshTransmissionMaterial, OrbitControls, Sphere, Stars, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AnimationMixer } from 'three'

export function Content() {
  // let sph = useRef()
  let stars1 = useRef()

  useFrame((st, dt) => {
    stars1.current.rotation.y += dt * 0.1
    // sph.current.position.z = Math.sin(st.clock.elapsedTime) * 2

    st.scene.backgroundIntensity = 0.2
  })

  let gltf = useGLTF('/mech/mech-2k-v2-webp.glb')
  gltf.scene.traverse((it) => {
    it.visible = true
    it.frustumCulled = false
  })
  let mixer = useMemo(() => {
    return new AnimationMixer(gltf.scene)
  }, [gltf])

  useEffect(() => {
    if (!mixer) {
      return
    }
    if (!gltf?.animations[0]) {
      return
    }
    let action = mixer.clipAction(gltf.animations[0])
    action.reset().play()
  }, [mixer, gltf])

  useFrame((st, dt) => {
    mixer.update(dt)
  })

  return (
    <>
      <OrbitControls object-position={[0, 1.5, 5]} target={[0, 1.5, 0]}></OrbitControls>
      <Environment files={`/envMap/evening_road_01_puresky_1k.hdr`}></Environment>
      <Stars ref={stars1}></Stars>
      {/* <Sphere ref={sph} scale={2}>
        <meshPhysicalMaterial roughness={0.01} metalness={0} transmission={1} thickness={1}></meshPhysicalMaterial>
      </Sphere> */}

      {gltf && <primitive object={gltf.scene}></primitive>}
    </>
  )
}
