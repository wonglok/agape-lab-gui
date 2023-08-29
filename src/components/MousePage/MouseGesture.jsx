import { Box, Environment, OrbitControls, RenderTexture } from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
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
  let cvp = viewport.getCurrentViewport(camera, [0, 0, 0])
  let max = Math.max(cvp.width, cvp.height)

  return (
    <>
      <group>
        {videoTexture && (
          <>
            {createPortal(
              <mesh scale={[-max, max, 1]} position={[0, 0, -10]}>
                <meshStandardMaterial map={videoTexture}></meshStandardMaterial>
                <planeBufferGeometry></planeBufferGeometry>
              </mesh>,
              camera,
            )}
          </>
        )}
        <primitive object={camera}></primitive>

        <Box args={[100, 0.1, 100]} name='floor_ground'>
          <meshStandardMaterial color={'red'}></meshStandardMaterial>
        </Box>
        <OrbitControls position={[0, 10, 10]} target={[0, 0, 0]} makeDefault></OrbitControls>

        <Environment files={`/lok/shanghai.hdr`}></Environment>
        <directionalLight></directionalLight>
        <ambientLight></ambientLight>
        {/*  */}
        <Hand></Hand>
        {/*  */}
      </group>
    </>
  )
}

function Hand() {
  let hands = useMouse((r) => r.hands)

  return (
    <group>
      {hands.map((r) => {
        return (
          <group visible={r.visible} key={r.uuid}>
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
      ref.current.position.lerp(hand.position, 0.1)
    }
  })
  return (
    <group ref={ref}>
      <Box></Box>
    </group>
  )
}
