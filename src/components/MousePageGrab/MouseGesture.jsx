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
import { Suspense, use, useEffect, useMemo, useRef } from 'react'
import { Scene, Vector3 } from 'three'
import { sceneToCollider } from './Noodle/sceneToCollider.js'
import { EffectComposer, N8AO, SSR } from '@react-three/postprocessing'
import { EnvSSRWorks } from './PostProcessing/EnvSSRWorks.jsx'
import { create } from 'zustand'

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

  let gl = useThree((r) => r.gl)
  useEffect(() => {
    useMouse.setState({ gl })
  }, [gl])

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
          <group userData={{ dragGroup: true }} scale={2} position={[2, 3, -4]}>
            <Computer></Computer>
          </group>

          <group userData={{ dragGroup: true }} scale={2} position={[-3, 5, -4]}>
            <Sphere args={[1, 32, 32]}>
              <meshPhysicalMaterial
                thickness={0.5}
                transmission={1}
                metalness={0}
                reflectivity={0.1}
                roughness={0.3}></meshPhysicalMaterial>
            </Sphere>
          </group>

          <group userData={{ dragGroup: true }} scale={2} position={[0, 0, -4]}>
            <Sphere args={[1, 32, 32]}>
              <meshPhysicalMaterial
                thickness={0.5}
                transmission={1}
                metalness={0}
                reflectivity={0.1}
                roughness={0.3}></meshPhysicalMaterial>
            </Sphere>
          </group>
        </group>

        {/* <gridHelper position={[0, 0.15, 0]} args={[100, 30, 0xff0000, 0xff0000]}></gridHelper> */}

        <OrbitControls
          rotateSpeed={-1}
          object-position={[0, 1.6, 10]}
          target={[0, 1.6, 10 - 1]}
          makeDefault></OrbitControls>

        <Hand></Hand>

        <Suspense fallback={null}>
          <Environment files={`/lok/shanghai.hdr`}></Environment>
          <group position={[0, -5, 4]} scale={5}>
            <BG></BG>
          </group>
        </Suspense>

        <Init></Init>

        <SelectiveBloomRender></SelectiveBloomRender>

        <Insert></Insert>
      </group>
    </>
  )
}

function Insert() {
  let stick = useMouse((r) => r.stick)
  let cursor = useMouse((r) => r.cursor)
  let ribbons = useMouse((r) => r.ribbons)
  return (
    <>
      {stick}
      {cursor}
      {ribbons}
    </>
  )
}

function SelectiveBloomRender() {
  // let bloomMeshes = useMouse((r) => r.bloomMeshes)
  // let bloomLights = useMouse((r) => r.bloomLights)

  let useStore = useMemo(() => {
    return create((set, get) => {
      return {
        postProcessingConfig: {
          multisampling: 0,
          emissiveIntensity: 4.89,
          envMapIntensity: 0.3,
          ssrPass: {
            useThisOne: true,
            intensity: 1,
            exponent: 1,
            distance: 10,
            fade: 0,
            roughnessFade: 1,
            thickness: 10,
            ior: 1.45,
            maxRoughness: 1,
            maxDepthDifference: 10,
            blend: 0.9,
            correction: 1,
            correctionRadius: 1,
            blur: 0,
            blurKernel: 1,
            blurSharpness: 10,
            jitter: 0.025,
            jitterRoughness: 0.025,
            steps: 8,
            refineSteps: 8,
            missedRays: true,
            useNormalMap: true,
            useRoughnessMap: true,
            resolutionScale: 1,
            velocityResolutionScale: 0.1,
          },
          bloomPass: {
            useThisOne: true,
            mipmapBlur: true,
            luminanceThreshold: 0.6700000000000003,
            intensity: 4.89,
            resolutionScale: 1,
          },
          wavePass: {
            useThisOne: false,
            speed: 1.0900000000000003,
            maxRadius: 1.07,
            waveSize: 1.09,
            amplitude: 0.29999999999999993,
            intensity: 0.5,
          },
          chromePass: {
            useThisOne: false,
            offsetX: 0.008000000000000018,
            offsetY: 0.008,
            radialModulation: true,
            modulationOffset: 0.5,
          },
          colorPass: {
            useThisOne: true,
            hue: 0,
            satuation: 0,
            brightness: 0,
            contrast: 0,
            saturation: 0,
          },
          aoPass: {
            useThisOne: true,
            intensity: 2,
            aoRadius: 1.9020000000000001,
            distanceFalloff: 2.5540000000000003,
            color: '#000000',
          },
        },
      }
    })
  }, [])

  let scene = useThree((r) => r.scene)
  useEffect(() => {
    //
  }, [scene])
  return (
    <>
      <EnvSSRWorks isGame={true} useStore={useStore}></EnvSSRWorks>
      {/* <EffectComposer multisampling={4} disableNormalPass>
        <N8AO intensity={5} aoRadius={3}></N8AO>
      </EffectComposer> */}
    </>
  )
}

function Computer() {
  let gltf = useGLTF(`/mini-homes/computer.glb`)
  return <primitive object={gltf.scene} />
}
function BG() {
  let gltf = useGLTF(`/teahouse/teahouse-opt-transformed.glb`)

  useEffect(() => {
    if (!gltf?.scene) {
      return
    }
    if (useMouse.getState().collider) {
      return
    }
    sceneToCollider({ scene: gltf.scene }).then((r) => {
      useMouse.setState({ collider: r })
    })
  }, [gltf.scene])
  return <primitive object={gltf.scene} />
}

function Init() {
  let scene = useMouse((r) => r.scene)
  let camera = useMouse((r) => r.camera)
  let gl = useMouse((r) => r.gl)
  let collider = useMouse((r) => r.collider)

  let inited = useMouse((r) => r.inited)
  useEffect(() => {
    if (!scene) {
      return
    }
    if (!camera) {
      return
    }
    if (!gl) {
      return
    }
    if (!collider) {
      return
    }
    if (inited) {
      return
    }

    useMouse.getState().initVideo()
    useMouse.getState().initTask()

    return () => {
      useMouse.getState().cleanMini()
    }
  }, [scene, gl, camera, collider, inited])

  return null
}
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
      ref.current.position.lerp(hand.position, 1.0)
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
