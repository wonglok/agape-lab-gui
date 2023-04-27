import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  SoftShadows,
  Float,
  CameraControls,
  Sky,
  PerformanceMonitor,
  OrbitControls,
  useHelper,
  Environment,
} from '@react-three/drei'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { easing } from 'maath'
import { Hospital } from './Hospital.jsx'
import { CameraHelper } from 'three'
function Light() {
  let dirL = useRef()
  const ref = useRef()
  // let lerp = new Object3D()
  useFrame((state, delta) => {
    // ref.current.getWorldPosition(lerp.position)

    // let raycaster = state.raycaster
    // raycaster.setFromCamera(state.mouse, state.camera)
    // let [pts] = raycaster.intersectObject(state.scene, true)
    // if (pts) {
    //   lerp.lookAt(pts.point.x, pts.point.y, pts.point.z)
    //   // ortho.current.target.set(pts.point.x, pts.point.y, pts.point.z)
    // }
    // ref.current.quaternion.slerp(lerp.quaternion, 0.1)
    //
    //
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 5, (state.pointer.x * Math.PI) / 5, 0],
      0.25,
      delta,
    )
  })
  let ortho = useRef()
  useHelper(ortho, CameraHelper, '#ff0000')
  return (
    <group position={[-10, 5, -10]} ref={ref}>
      <directionalLight
        color={'#f48d2e'}
        ref={dirL}
        position={[-5, 5, -5]}
        castShadow
        intensity={2}
        shadow-mapSize={2048}
        shadow-bias={-0.002}>
        <orthographicCamera ref={ortho} attach='shadow-camera' args={[-33.3, 33.3, 33.3, -33.3, 0.1, 50]} />
      </directionalLight>
    </group>
  )
}

export default function App() {
  const { impl, debug, enabled, samples, ...config } = useControls({
    debug: true,
    enabled: true,
    size: { value: 35, min: 0, max: 100, step: 0.1 },
    focus: { value: 0.5, min: 0, max: 2, step: 0.1 },
  })

  return (
    <Canvas
      gl={{ logarithmicDepthBuffer: true }}
      onCreated={(st) => {
        st.gl.useLegacyLights = true
      }}
      shadows
      camera={{ position: [5, 2, 10], fov: 80 }}>
      {debug && <Perf position='top-left' />}
      <PerformanceMonitor />
      {enabled && <SoftShadows {...config} samples={6} />}
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI * 0.5}
        enablePan={true}
        minPolarAngle={Math.PI * 0.25}
        maxDistance={10.5 * 30.0}></OrbitControls>

      {/* <CameraControls makeDefault /> */}
      {/* <color attach="background" args={["#d0d0d0"]} />
      <fog attach="fog" args={["#d0d0d0", 8, 35]} /> */}
      {/* <ambientLight intensity={0.1} /> */}
      {/* <group rotation={[0, 1.4, 0]}>
        <Sphere scale={1.5} />
        <Sphere position={[1, 4, -8]} scale={0.3} />
        <Sphere position={[-1, 2, -8]} scale={0.8} />
      </group> */}
      <Light />

      <group rotation={[0, 1.4, 0]}>
        <group position={[25, -1, -2]}>
          <group rotation={[0, Math.PI * -1.0, 0]}>
            <Hospital scale={1} />
            {/* */}
          </group>
        </group>
      </group>

      {/* <Room scale={0.5} position={[0, -1, 0]} /> */}
      <Sky inclination={0.52} scale={320} />
      <Environment preset='sunset' background></Environment>
    </Canvas>
  )
}

// function Sphere({ color = "hotpink", floatIntensity = 15, position = [0, 5, -8], scale = 1 }) {
//   return (
//     <Float floatIntensity={floatIntensity}>
//       <mesh castShadow position={position} scale={scale}>
//         <sphereGeometry />
//         <meshBasicMaterial color={color} roughness={1} />
//       </mesh>
//     </Float>
//   )
// }
