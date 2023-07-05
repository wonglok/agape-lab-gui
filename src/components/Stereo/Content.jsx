import { Box, Environment, MeshTransmissionMaterial, Sphere, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function Content() {
  let sph = useRef()
  let stars1 = useRef()

  useFrame((st, dt) => {
    stars1.current.rotation.y += dt * 0.1
    sph.current.position.z = Math.sin(st.clock.elapsedTime) * 2

    st.scene.backgroundIntensity = 0.2
  })

  return (
    <>
      <Environment background files={`/envMap/evening_road_01_puresky_1k.hdr`}></Environment>
      <Stars ref={stars1}></Stars>
      <Sphere ref={sph} scale={2}>
        <meshPhysicalMaterial roughness={0.01} metalness={0} transmission={1} thickness={1}></meshPhysicalMaterial>
      </Sphere>
    </>
  )
}
