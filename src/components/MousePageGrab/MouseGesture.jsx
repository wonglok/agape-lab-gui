import {
  Box,
  Environment,
  Icosahedron,
  MeshTransmissionMaterial,
  OrbitControls,
  Sphere,
  Plane,
  useGLTF,
  MeshDiscardMaterial,
} from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { Vector3 } from 'three'

//DoubleSide, Spherical,
// import { Bloom, EffectComposer } from '@react-three/postprocessing'
// import { Vector2 } from 'three'
// import { PerspectiveCamera } from 'three'

// import { WorldBirdy } from '../worldbirdy/WorldBirdy'
// import { WaterSurfaceAvatarContent } from '../WaterSurfaceAvatar/WaterSurfaceAvatar'
// import { Object3D } from 'three'
// import { Vector3 } from 'three'

export function MouseGesture() {
  let videoTexture = useMouse((r) => r.videoTexture)

  let camera = useThree((r) => r.camera)
  useEffect(() => {
    useMouse.setState({ camera })
  }, [camera])

  let scene = useThree((r) => r.scene)
  useEffect(() => {
    useMouse.setState({ scene })
  }, [scene])

  let viewport = useThree((r) => r.viewport)

  let controls = useThree((r) => r.controls)

  useEffect(() => {
    if (controls?.target) {
      useMouse.setState({ viewport, controlsTarget: new Vector3(0, controls?.target.y, 0) })
    }
  }, [viewport, controls?.target])

  useFrame((st, dt) => {
    useMouse.getState().onLoop(st, dt)
  })

  // useEffect(() => {
  //   useMouse.getState().initVideo()
  //   useMouse.getState().initTask()
  // }, [])

  return (
    <>
      <group>
        {videoTexture && <>{createPortal(<></>, camera)}</>}

        {/* <mesh scale={[-7.5, 7.5, 7.5]} position={[0, 5, -10]}>
          <meshStandardMaterial transparent side={DoubleSide} opacity={0.5} map={videoTexture}></meshStandardMaterial>
          <planeGeometry args={[1, 1]}></planeGeometry>
        </mesh> */}

        <primitive object={camera}></primitive>

        <group name='raycast-group'>
          <group userData={{ dragGroup: true }} position={[1, 3, -1]} scale={1}>
            <Computer></Computer>
          </group>

          <group userData={{ dragGroup: true }} scale={1} position={[-3, 4, -3]}>
            <Sphere args={[1, 32, 32]}>
              <MeshTransmissionMaterial
                thickness={1.5}
                transmission={1}
                reflectivity={1}
                roughness={0.15}></MeshTransmissionMaterial>
            </Sphere>
          </group>

          <group userData={{ dragGroup: true }} scale={1} position={[-2, 2, -3]}>
            <Sphere args={[1, 32, 32]}>
              <MeshTransmissionMaterial
                thickness={1.5}
                transmission={1}
                reflectivity={1}
                roughness={0.15}></MeshTransmissionMaterial>
            </Sphere>
          </group>
        </group>

        {/* <gridHelper position={[0, 0.15, 0]} args={[100, 30, 0xff0000, 0xff0000]}></gridHelper> */}

        <OrbitControls object-position={[0, 1.6, 10]} target={[0, 1.6, 10 - 1]} makeDefault></OrbitControls>

        <Hand></Hand>

        <Suspense fallback={null}>
          <Environment files={`/lok/shanghai.hdr`}></Environment>
          <group position={[0, -5 * 3, 10 * 0]} scale={5 * 2}>
            <BG></BG>
          </group>
        </Suspense>
        {/* <EffectComposer multisampling={4} disableNormalPass>
          <Bloom luminanceThreshold={0.0} intensity={1} mipmapBlur height={300} />
        </EffectComposer> */}
      </group>
    </>
  )
}

function Computer() {
  let gltf = useGLTF(`/mini-homes/computer.glb`)
  return <primitive object={gltf.scene} />
}
function BG() {
  let gltf = useGLTF(`/teahouse/teahouse-opt-transformed.glb`)
  return <primitive object={gltf.scene} />
}
// function World() {
//   let point = new Vector3()
//   useFrame(() => {
//     let hands = useMouse.getState().hands
//     if (hands[0]?.position) {
//       point.copy(hands[0]?.position)
//     }
//   })
//   return (
//     <>
//       {
//         <>
//           <group position={[0, -0.5, 0]}>
//             <group rotation={[Math.PI * -0.5, 0, 0]}>
//               <WaterSurfaceAvatarContent point={point}></WaterSurfaceAvatarContent>
//             </group>
//           </group>

//           <group scale={[1, 1, 1]}>
//             <WorldBirdy cape={new Object3D()} point={point}></WorldBirdy>
//           </group>
//         </>
//       }
//     </>
//   )
// }

function Hand() {
  let hands = useMouse((r) => r.hands)
  return (
    <group>
      {hands.map((r) => {
        return (
          <group key={r.uuid}>
            <OneHand hand={r}></OneHand>
          </group>
        )
      })}
    </group>
  )
}

function OneHand({ hand }) {
  let ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(hand.position, 0.9)
      ref.current.visible = hand.visible
    }
  })

  return (
    <group ref={ref}>
      <Icosahedron frustumCulled={false} position={[0, 0, 0]} args={[0.1, 0]}>
        <meshPhysicalMaterial color={'#0000ff'} metalness={1} roughness={0.0}></meshPhysicalMaterial>
      </Icosahedron>
    </group>
  )
}
//
//
//
//

///////
