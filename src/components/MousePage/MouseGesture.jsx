import { Box, Environment, MeshTransmissionMaterial, OrbitControls, Sphere } from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
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

  let bg = useRef()
  useFrame(({ controls, size }) => {
    if (bg.current) {
      let cvp = viewport.getCurrentViewport(controls.object, controls.target.toArray(), size)

      bg.current.scale.fromArray([-cvp.width, cvp.height, 1])
      bg.current.lookAt(...controls.object.position.toArray())
    }
  })

  return (
    <>
      <group>
        {videoTexture && (
          <>
            <mesh ref={bg} position={[0, 0, 0]}>
              <meshStandardMaterial
                depthTest={false}
                transparent
                opacity={0.1333}
                map={videoTexture}></meshStandardMaterial>
              <planeBufferGeometry></planeBufferGeometry>
            </mesh>
          </>
        )}

        <primitive object={camera}></primitive>

        <Box args={[5000, 0.01, 5000]} name='floor_ground'>
          <meshStandardMaterial color={'#bababa'}></meshStandardMaterial>
        </Box>

        <gridHelper position={[0, 1, 0]} args={[500, 500, 0xffffff, 0xff0000]}></gridHelper>
        <OrbitControls object-position={[0, 10, 10]} target={[0, 0, 0]} makeDefault></OrbitControls>

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
      ref.current.position.lerp(hand.position, 0.5)
      ref.current.visible = hand.visible
    }
  })

  return (
    <group ref={ref}>
      <Sphere position={[0, 1, 0]} args={[1, 25, 25]}>
        <MeshTransmissionMaterial thickness={2} roughness={0.2}></MeshTransmissionMaterial>
      </Sphere>
    </group>
  )
}
