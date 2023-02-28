import { Ball2kJSX } from '@/components/ball2k/Ball2kJSX'
import { MixMat } from '@/components/substance-painter/MixMat/MixMat'
import {
  Box,
  Center,
  Cone,
  Cylinder,
  Effects,
  Environment,
  Loader,
  OrbitControls,
  Plane,
  Sphere,
  Stage,
  Torus,
  TorusKnot,
  useAnimations,
  useGLTF,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer, SSR } from '@react-three/postprocessing'
import { Suspense, useEffect } from 'react'

export default function Material() {
  return (
    <div className='w-full h-full'>
      <Canvas>
        <Suspense fallback={null}>
          <Ball2kJSX></Ball2kJSX>
          <EffectComposer>
            <Bloom></Bloom>
          </EffectComposer>
          <Environment preset='sunset'></Environment>
          <OrbitControls target={[0, 1, 0]}></OrbitControls>
        </Suspense>

        <Box position={[0, -0.05, 0]} args={[100, 0.05, 100]}>
          <meshStandardMaterial color={'#000000'} roughness={0.2} metalness={0.5}></meshStandardMaterial>
        </Box>

        <Box position={[0, -0.05, -5]} args={[100, 100, 0.05]}>
          <meshStandardMaterial color={'#000000'} roughness={0.2} metalness={0.5}></meshStandardMaterial>
        </Box>

        <Box position={[-20, -0.05, 0]} args={[0.05, 100, 100]}>
          <meshStandardMaterial color={'#000000'} roughness={0.2} metalness={0.5}></meshStandardMaterial>
        </Box>
        <Box position={[20, -0.05, 0]} args={[0.05, 100, 100]}>
          <meshStandardMaterial color={'#000000'} roughness={0.2} metalness={0.5}></meshStandardMaterial>
        </Box>
        {/*  */}
      </Canvas>
      <Loader></Loader>
    </div>
  )
}

// function Content() {
//   let glb = useGLTF(`/2022/02/28/mech/ball2k.glb`)
//   let anim = useAnimations(glb.animations, glb.scene)

//   useEffect(() => {
//     glb.scene.traverse((it) => {
//       it.frustumCulled = false

//       if (it.name === 'RetopoFlow002') {
//         it.material = new MeshPhysicalMaterial({
//           transmission: 1.0,
//           thickness: 0.2,
//           ior: 1.5,
//           roughness: 0.0,
//           map: it.material.map,
//           roughnessMap: it.material.roughnessMap,
//           normalMap: it.material.normalMap,
//           metalnessMap: it.material.metalnessMap,
//         })
//       }
//     })
//   }, [glb])

//   useEffect(() => {
//     anim.names.forEach((n) => {
//       anim.actions[n]?.play()
//     })
//   }, [anim])

//   return (
//     <group onClick={(ev) => {}}>
//       <primitive object={glb.scene}></primitive>
//     </group>
//   )
// }
