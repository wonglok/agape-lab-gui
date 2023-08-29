import { Box, Environment, OrbitControls, RenderTexture } from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { PerspectiveCamera } from 'three'
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
                opacity={0.1}
                map={videoTexture}></meshStandardMaterial>
              <planeBufferGeometry></planeBufferGeometry>
            </mesh>
          </>
        )}
        <primitive object={camera}></primitive>

        <Box args={[5000, 0.01, 5000]} name='floor_ground'>
          <meshStandardMaterial color={'#bababa'}></meshStandardMaterial>
        </Box>

        <gridHelper position={[0, 1, 0]} args={[5000, 500, 0xffffff, 0xff0000]}></gridHelper>
        <OrbitControls object-position={[0, 10, 10]} target={[0, 0, 0]} makeDefault></OrbitControls>

        <Environment files={`/lok/shanghai.hdr`}></Environment>

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
      <Box position={[0, 2, 0]} args={[2, 2, 2]}></Box>
    </group>
  )
}
