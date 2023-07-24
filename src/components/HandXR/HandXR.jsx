import React, { useState, useEffect, Fragment, useMemo } from 'react'
import { Hands, VRButton, XR, XRButton } from '@react-three/xr'
import { useThree, useFrame, Canvas } from '@react-three/fiber'
import { Box, OrbitControls, Plane, Sphere, Sky, useGLTF, useFBX, Environment } from '@react-three/drei'
import { usePlane, useBox, Physics, useSphere } from '@react-three/cannon'
import { joints } from './joints'
import { AnimationMixer } from 'three'

function Cube({ position, args = [0.065, 0.065, 0.065] }) {
  const [boxRef] = useBox(() => ({ position, mass: 1, args }))
  // const [tex] = useMatcapTexture('C7C0AC_2E181B_543B30_6B6270')

  return (
    <Box ref={boxRef} args={args} castShadow>
      <meshStandardMaterial attach='material' color='#ffff00' roughness={0} metalness={0.5} />
      {/* <meshMatcapMaterial attach='material' matcap={tex} /> */}
    </Box>
  )
}

function JointCollider({ index, hand }) {
  const { gl } = useThree()
  const handObj = gl.xr.getHand(hand)
  const joint = handObj.joints[joints[index]]
  const size = joint.jointRadius ?? 0.0001
  const [tipRef, api] = useSphere(() => ({ args: size, position: [-1, 0, 0] }))
  useFrame(() => {
    if (joint === undefined) return
    api.position.set(joint.position.x, joint.position.y, joint.position.z)
  })

  return (
    <Sphere ref={tipRef} args={[size]}>
      <meshBasicMaterial transparent opacity={0} attach='material' />
    </Sphere>
  )
}

function HandsReady(props) {
  const [ready, setReady] = useState(false)
  const { gl } = useThree()
  useEffect(() => {
    if (ready) return
    const joint = gl.xr.getHand(0).joints['index-finger-tip']
    if (joint?.jointRadius !== undefined) return
    const id = setInterval(() => {
      const joint = gl.xr.getHand(0).joints['index-finger-tip']
      if (joint?.jointRadius !== undefined) {
        setReady(true)
      }
    }, 500)
    return () => {
      clearInterval(id)
    }
  }, [gl, ready])

  return ready ? props.children : null
}

const HandsColliders = () =>
  [...Array(25)].map((_, i) => (
    <Fragment key={i}>
      <JointCollider index={i} hand={0} />
      <JointCollider index={i} hand={1} />
    </Fragment>
  ))

function Scene() {
  const [floorRef] = usePlane(() => ({
    args: [10, 10],
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0.8, 0],
    type: 'Static',
  }))

  return (
    <>
      <group scale={1} position={[0, -0.05, -2]}>
        <Avatar></Avatar>
      </group>
      <Plane ref={floorRef} args={[10, 10]} receiveShadow>
        <meshStandardMaterial attach='material' color='#fff' transparent opacity={0.5} />
      </Plane>
      <Hands />
      <HandsReady>
        <HandsColliders />
      </HandsReady>
      {[...Array(7)].map((_, i) => (
        <Cube key={i} position={[0, 1.1 + 0.1 * i, -0.5]} />
      ))}
      <OrbitControls />
      <ambientLight intensity={0.5} />
      {/* <spotLight position={[1, 8, 1]} angle={0.3} penumbra={1} intensity={1} castShadow /> */}
    </>
  )
}

function Avatar() {
  let glb = useGLTF(`/rpm/avatar/default-lok.glb`)
  let motion = {
    talk: useFBX(`/rpm/rpm-actions-emoji/talk-phone.fbx`),
  }

  let mixer = useMemo((r) => {
    return new AnimationMixer()
  }, [])
  useFrame((st, dt) => {
    mixer.update(dt)
  })
  useEffect(() => {
    mixer.clipAction(motion.talk.animations[0], glb.scene).reset().play()
  }, [glb.scene, mixer, motion])

  return <primitive object={glb.scene}></primitive>
}

export const HandXR = () => (
  <>
    <Canvas>
      <XR>
        <Physics
          gravity={[0, -2, 0]}
          iterations={20}
          defaultContactMaterial={{
            friction: 0.09,
          }}>
          <Scene />
        </Physics>
      </XR>

      {/*  */}
      <Environment files={`/lok/shanghai.hdr`}></Environment>
    </Canvas>
    <div className='absolute bottom-0 left-0 flex items-center justify-center w-full'>
      <div className='p-6 mb-5 bg-lime-500'>
        <XRButton
          /* The type of `XRSession` to create */
          mode={'AR'}
          /**
           * `XRSession` configuration options
           * @see https://immersive-web.github.io/webxr/#feature-dependencies
           * ///, 'layers'
           */
          sessionInit={{
            // requiredFeatures: [],
            requiredFeatures: ['hand-tracking'], // 'bounded-floor', 'plane-detection',
          }}
          /** Whether this button should only enter an `XRSession`. Default is `false` */
          enterOnly={false}
          /** Whether this button should only exit an `XRSession`. Default is `false` */
          exitOnly={false}
          /** This callback gets fired if XR initialization fails. */
          onError={(error) => {}}>
          {/* Can accept regular DOM children and has an optional callback with the XR button status (unsupported, exited, entered) */}
          {(status) => status}
        </XRButton>
      </div>
    </div>
  </>
)
