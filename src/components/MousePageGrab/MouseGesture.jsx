import { Box, Environment, MeshTransmissionMaterial, OrbitControls, Sphere } from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { DoubleSide, Spherical } from 'three'
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
      useMouse.setState({ viewport, controlsTarget: controls.target })
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
          <Sphere position={[3, 3, -3]}>
            <meshStandardMaterial color={'red'}></meshStandardMaterial>
          </Sphere>

          <Sphere position={[-3, 4, -3]}>
            <meshStandardMaterial color={'green'}></meshStandardMaterial>
          </Sphere>

          <Sphere position={[-2, 2, -3]}>
            <meshStandardMaterial color={'blue'}></meshStandardMaterial>
          </Sphere>
        </group>

        <gridHelper position={[0, 0.15, 0]} args={[100, 100, 0xff0000, 0xff0000]}></gridHelper>

        <OrbitControls object-position={[0, 3, 10]} target={[0, 0, 0]} makeDefault></OrbitControls>

        <Environment files={`/lok/shanghai.hdr`}></Environment>

        <Hand></Hand>
      </group>
    </>
  )
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
            <Onehand hand={r}></Onehand>
          </group>
        )
      })}
    </group>
  )
}

function Onehand({ hand }) {
  let ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(hand.position, 0.9)
      ref.current.visible = hand.visible
    }
  })

  return (
    <group ref={ref}>
      <Sphere frustumCulled={false} position={[0, 0, 0]} args={[0.235, 25, 25]}>
        <meshPhysicalMaterial color={'#0000ff'} metalness={1} roughness={0.0}></meshPhysicalMaterial>
      </Sphere>
    </group>
  )
}
//
//
//
//

///////
