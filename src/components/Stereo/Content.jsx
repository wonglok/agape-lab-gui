import { Box, MeshTransmissionMaterial, Sphere, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function Content() {
  let sph = useRef()
  let stars1 = useRef()

  useFrame((st, dt) => {
    stars1.current.rotation.y += dt * 0.1
    sph.current.position.z = Math.sin(st.clock.elapsedTime) * 2
  })
  return (
    <>
      <Stars ref={stars1}></Stars>
      <Sphere ref={sph} scale={2}>
        <meshPhysicalMaterial roughness={0.01} transmission={1} thickness={3}></meshPhysicalMaterial>
      </Sphere>
    </>
  )
}
