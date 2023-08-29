import { Box, Environment, MeshTransmissionMaterial, OrbitControls, Sphere } from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { useFrame, useThree } from '@react-three/fiber'
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

  let ref = useRef()
  useFrame(({ camera, viewport, size }) => {
    //
    if (ref.current) {
      let vp = viewport.getCurrentViewport(camera, [0, 0, 1], size)

      ref.current.scale.x = -vp.width
      ref.current.scale.y = vp.height
      ref.current.scale.z = 1

      // ref.current.lookAt(camera.position.x, camera.position.y, camera.position.z)
    }
    //
  })
  return (
    <>
      <group>
        {videoTexture && (
          <>
            <mesh ref={ref}>
              <meshStandardMaterial
                transparent
                side={DoubleSide}
                opacity={0.5}
                map={videoTexture}></meshStandardMaterial>
              <planeGeometry args={[1, 1]}></planeGeometry>
            </mesh>
          </>
        )}

        <primitive object={camera}></primitive>

        <group name='floor_ground'>
          <Box userData={{ hoverable: true }} position={[0, 0, -20]} args={[100, 100, 0.5]}>
            <meshStandardMaterial color={'#bababa'} side={DoubleSide}></meshStandardMaterial>
          </Box>

          <Box userData={{ draggable: true }} position={[0, 4 - 10, -5]} args={[10, 5, 0.5]}>
            <meshStandardMaterial color={'#fffff'} side={DoubleSide}></meshStandardMaterial>
          </Box>

          <Box userData={{ draggable: true }} position={[10, 10 - 10, -5 + 3]} args={[10, 5, 0.5]}>
            <meshStandardMaterial color={'#fffff'} side={DoubleSide}></meshStandardMaterial>
          </Box>

          <Box userData={{ draggable: true }} position={[-10, 10 - 10, -5 + 0]} args={[10, 5, 0.5]}>
            <meshStandardMaterial color={'#fffff'} side={DoubleSide}></meshStandardMaterial>
          </Box>
        </group>

        <OrbitControls
          object-position={[0, 0, 20 + 0.001]}
          maxDistance={0.0001}
          minDistance={0.0001}
          target={[0, 0, 19]}
          rotateSpeed={-1}
          makeDefault></OrbitControls>

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
      <Sphere frustumCulled={false} position={[0, 0, 0]} args={[1, 25, 25]}>
        <MeshTransmissionMaterial color={'#00ff00'} thickness={2} roughness={0.2}></MeshTransmissionMaterial>
      </Sphere>
    </group>
  )
}
//
//
//
//

///////
