import React, { useState, useEffect, Fragment, useMemo } from 'react'
import { Hands, VRButton, XR, XRButton } from '@react-three/xr'
import { useThree, useFrame, Canvas } from '@react-three/fiber'
import {
  Box,
  OrbitControls,
  Plane,
  Sphere,
  Sky,
  useGLTF,
  useFBX,
  Environment,
  useTexture,
  MeshDiscardMaterial,
} from '@react-three/drei'
import { usePlane, useBox, Physics, useSphere, useConvexPolyhedron } from '@react-three/cannon'
import { joints } from './joints'
import { AnimationMixer } from 'three'
import { Geometry, Face3 } from './Geo'
// import { WaterSurfaceContent } from '../WaterSurface/WaterSurface'
/**
 * Returns legacy geometry vertices, faces for ConvP
 * @param {THREE.BufferGeometry} bufferGeometry
 */
function toConvexProps(bufferGeometry) {
  const geo = new Geometry().fromBufferGeometry(bufferGeometry)
  // Merge duplicate vertices resulting from glTF export.
  // Cannon assumes contiguous, closed meshes to work
  geo.mergeVertices()
  return [geo.vertices.map((v) => [v.x, v.y, v.z]), geo.faces.map((f) => [f.a, f.b, f.c]), []]
}

function WoodMaterial() {
  let myTexture = useTexture({
    map: '/bricks/Wood048_1K-JPG/Wood048_1K_Color.jpg',
    normalMap: '/bricks/Wood048_1K-JPG/Wood048_1K_NormalGL.jpg',
    roughnessMap: '/bricks/Wood048_1K-JPG/Wood048_1K_Roughness.jpg',
    // metalnessMap: '/bricks/Wood048_1K-JPG/Wood048_1K_Displacement.jpg',
  })
  return <meshStandardMaterial {...myTexture}></meshStandardMaterial>
}

function Arch({ position = [0, 1.2, 0], ...props }) {
  const { nodes } = useGLTF('/bricks/Arch.glb')
  const selectGeo = nodes.Arch.geometry.clone()
  selectGeo.scale(0.75, 0.75, 0.75)
  const geo = useMemo(() => toConvexProps(selectGeo), [selectGeo])
  const [ref] = useConvexPolyhedron(() => ({
    ...props,
    position: position,
    mass: 1,
    args: geo,
  }))

  return (
    <mesh castShadow receiveShadow ref={ref} geometry={selectGeo} {...props}>
      <WoodMaterial></WoodMaterial>
      {/* <meshStandardMaterial color='yellow' roughness={0} metalness={0.5} /> */}
    </mesh>
  )
}

function Rectangle({ position = [0, 1.2, 0], ...props }) {
  const { nodes } = useGLTF('/bricks/Rectangle.glb')
  const selectGeo = nodes.Rectangle.geometry.clone()
  selectGeo.scale(0.75, 0.75, 0.75)
  const geo = useMemo(() => toConvexProps(selectGeo), [selectGeo])
  const [ref] = useConvexPolyhedron(() => ({
    ...props,
    position: position,
    mass: 1,
    args: geo,
  }))

  return (
    <mesh castShadow receiveShadow ref={ref} geometry={selectGeo} {...props}>
      <WoodMaterial></WoodMaterial>

      {/* <meshStandardMaterial color='yellow' roughness={0} metalness={0.5} /> */}
    </mesh>
  )
}

function Triangle({ position = [0, 1.2, 0], ...props }) {
  const { nodes } = useGLTF('/bricks/Triangle.glb')
  const selectGeo = nodes.Triangle.geometry.clone()
  selectGeo.scale(0.75, 0.75, 0.75)
  const geo = useMemo(() => toConvexProps(selectGeo), [selectGeo])
  const [ref] = useConvexPolyhedron(() => ({
    ...props,
    position: position,
    mass: 1,
    args: geo,
  }))

  return (
    <mesh castShadow receiveShadow ref={ref} geometry={selectGeo} {...props}>
      <WoodMaterial></WoodMaterial>

      {/* <meshStandardMaterial color='yellow' roughness={0} metalness={0.5} /> */}
    </mesh>
  )
}

function Cube2({ position = [0, 1.2, 0], ...props }) {
  const { nodes } = useGLTF('/bricks/Cube.glb')
  const selectGeo = nodes.Cube.geometry.clone()
  selectGeo.scale(0.75, 0.75, 0.75)
  const geo = useMemo(() => toConvexProps(selectGeo), [selectGeo])
  const [ref] = useConvexPolyhedron(() => ({
    ...props,
    position: position,
    mass: 1,
    args: geo,
  }))

  return (
    <mesh castShadow receiveShadow ref={ref} geometry={selectGeo} {...props}>
      <WoodMaterial></WoodMaterial>

      {/* <meshStandardMaterial color='yellow' roughness={0} metalness={0.5} /> */}
    </mesh>
  )
}

function Cube({ position, args = [0.065 / 2, 0.065 / 2, 0.065 / 2] }) {
  const [boxRef] = useBox(() => ({ position, mass: 1, args }))
  // const [tex] = useMatcapTexture('C7C0AC_2E181B_543B30_6B6270')

  return (
    <Box ref={boxRef} args={args} castShadow>
      <WoodMaterial></WoodMaterial>

      {/* <meshStandardMaterial attach='material' color='#ffff00' roughness={0} metalness={0.5} /> */}
      {/* <meshMatcapMaterial attach='material' matcap={tex} /> */}
    </Box>
  )
}

function JointCollider({ index, hand }) {
  const { gl } = useThree()
  const handObj = gl.xr.getHand(hand)
  const joint = handObj.joints[joints[index]]
  let size = 0
  if (joint) {
    size = joint.jointRadius ?? 0.0001
    size *= 1.333
  }

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
    position: [0, 0.9, 0],
    type: 'Static',
  }))

  return (
    <>
      <group scale={1} position={[0, -0.05, -2]}>
        <Avatar></Avatar>
      </group>

      {/* <group rotation={[Math.PI * -0.5, 0, 0]}>
        <WaterSurfaceContent></WaterSurfaceContent>
      </group> */}

      {[...Array(5)].map((_, i) => (
        <Arch key={'arch' + i} position={[0.3, 1.1 + 0.1 * i, -0.5]}></Arch>
      ))}
      {[...Array(5)].map((_, i) => (
        <Cube2 key={'cube' + i} position={[0.6, 1.1 + 0.1 * i, -0.5]}></Cube2>
      ))}
      {[...Array(5)].map((_, i) => (
        <Triangle key={'Triangle' + i} position={[0.9, 1.1 + 0.1 * i, -0.5]}></Triangle>
      ))}
      {[...Array(5)].map((_, i) => (
        <Rectangle key={'Rectangle' + i} position={[1.2, 1.1 + 0.1 * i, -0.5]}></Rectangle>
      ))}

      <Plane ref={floorRef} args={[10, 10]} receiveShadow>
        <MeshDiscardMaterial></MeshDiscardMaterial>
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
      <Environment path={'https://lab.agape.land'} files={`/lok/shanghai.hdr`}></Environment>
    </Canvas>
    <div className='absolute bottom-0 left-0 flex items-center justify-center w-full'>
      <div className='mb-5 text-2xl bg-lime-500'>
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
          {(status) => (status === 'unsupported' ? `Enter` : `Enter`)}
        </XRButton>
      </div>
    </div>
  </>
)
