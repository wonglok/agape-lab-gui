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
  Text3D,
  Center,
  Text,
  PerspectiveCamera,
} from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, Scene, Vector3 } from 'three'
import { sceneToCollider } from './Noodle/sceneToCollider.js'
import { EnvSSRWorks } from './PostProcessing/EnvSSRWorks.jsx'
import { create } from 'zustand'
import anime from 'animejs'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { Ray, Matrix4, Sphere as Sphere3JS } from 'three'

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

  let mouse = useThree((r) => r.mouse)
  useEffect(() => {
    useMouse.setState({ mouse })
  }, [mouse])

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

        <group userData={{ dragGroup: false }} position={[0, 2, -4]}>
          <Text3D size={1.5} textAlign='center' font={`/font/days_regular_macroman/Days_Regular.json`}>
            {`=`}
            <meshPhysicalMaterial
              side={DoubleSide}
              transmission={1}
              roughness={0.5}
              color={'blue'}></meshPhysicalMaterial>
          </Text3D>
        </group>

        <group name='raycast-group'>
          <MathSymbol position={[-3, 2, -4]} left={'+ 1'} right='- 1'></MathSymbol>

          <MathSymbol position={[-8, 2, -4]} left={'+ 2x'} right='- 2x'></MathSymbol>

          <MathSymbol position={[3, 2, -4]} left={'+ 3'} right='- 3'></MathSymbol>

          {/*
          <group userData={{ dragGroup: true }} scale={2} position={[0, 0, -4]}>
            <Sphere args={[1, 32, 32]}>
              <meshPhysicalMaterial
                thickness={0.5}
                transmission={1}
                metalness={0}
                reflectivity={0.1}
                roughness={0.3}></meshPhysicalMaterial>
            </Sphere>
          </group> */}

          {/*  */}
        </group>

        {/* <gridHelper position={[0, 0.15, 0]} args={[100, 30, 0xff0000, 0xff0000]}></gridHelper> */}

        <PerspectiveCamera near={0.5} far={300} fov={76} makeDefault></PerspectiveCamera>

        <OrbitControls
          rotateSpeed={-1}
          object-position={[0, 1.6, 10]}
          target={[0, 1.6, 10 - 1]}
          makeDefault></OrbitControls>

        <Hand></Hand>

        <Suspense fallback={null}>
          <Environment background files={`/hdr/grass.hdr`}></Environment>
          <group position={[0, -10, 3]} scale={10}>
            <BG></BG>
          </group>
        </Suspense>

        <Init></Init>

        <SelectiveBloomRender></SelectiveBloomRender>

        <Insert></Insert>

        <DragGUI></DragGUI>
      </group>
    </>
  )
}

function DragGUI() {
  let gl = useThree((r) => r.gl)
  let scene = useThree((r) => r.scene)
  let camera = useThree((r) => r.camera)
  let controls = useThree((r) => r.controls)
  useEffect(() => {
    let dragMeshes = []

    scene.traverse((r) => {
      if (r.userData.dragGroup && !r.geometry) {
        dragMeshes.push(r)
      }
    })

    let dc = new DragControls(dragMeshes, camera, gl.domElement)
    dc.addEventListener('dragstart', (event) => {
      controls.enabled = false
    })
    dc.addEventListener('dragend', (event) => {
      controls.enabled = true
    })
    return () => {
      dc.dispose()
    }
  }, [gl, camera, scene, controls])
  return (
    <>
      {/* <></DragControls> */}
      {/*  */}
    </>
  )
}

const _inverseMatrix = new Matrix4()
const _ray = new Ray()
const _sphere = new Sphere3JS()
const _vA = new Vector3()

function meshBounds(raycaster, intersects) {
  const geometry = this.geometry
  const material = this.material
  const matrixWorld = this.matrixWorld
  if (material === undefined) return

  //
  // Checking boundingSphere distance to ray
  if (geometry.boundingSphere === null) geometry.computeBoundingSphere()
  _sphere.copy(geometry.boundingSphere)
  _sphere.radius = _sphere.radius * 1.5
  _sphere.applyMatrix4(matrixWorld)
  if (raycaster.ray.intersectsSphere(_sphere) === false) return
  _inverseMatrix.copy(matrixWorld).invert()
  _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix)
  // Check boundingBox before continuing
  if (geometry.boundingBox !== null && _ray.intersectBox(geometry.boundingBox, _vA) === null) return
  intersects.push({
    distance: _vA.distanceTo(raycaster.ray.origin),
    point: _vA.clone(),
    object: this,
  })
}

function MathSymbol({ position, left = '', right = '' }) {
  let ref = useRef()

  let [side, setSide] = useState('')

  let v3 = useMemo(() => {
    return new Vector3(0, 0, 0)
  }, [])

  useFrame(() => {
    if (ref.current) {
      ref.current.getWorldPosition(v3)

      let shouldBeSide = v3.x >= 0 ? 'right' : 'left'

      if (side !== shouldBeSide) {
        ref.current.rotation.x = 0
        anime({
          duration: 1000,
          targets: [ref.current.rotation],
          x: Math.PI * 2,
          easing: 'easeInOutQuad',
        })
        setSide(shouldBeSide)
      }
    }
  })

  return (
    <>
      <group position={position} userData={{ dragGroup: true }}>
        <Center>
          <Text3D
            anchorX={'center'}
            anchorY={'middle'}
            ref={ref}
            size={1.5}
            textAlign='center'
            raycast={meshBounds}
            font={`/font/days_regular_macroman/Days_Regular.json`}>
            {side === 'left' && left}
            {side === 'right' && right}
            <meshPhysicalMaterial
              side={DoubleSide}
              transmission={1}
              roughness={0.5}
              thickness={2}
              color={'blue'}></meshPhysicalMaterial>
          </Text3D>
        </Center>
      </group>
    </>
  )
}

function Insert() {
  let stick = useMouse((r) => r.stick)
  let cursor = useMouse((r) => r.cursor)
  let hoverPlane = useMouse((r) => r.hoverPlane)
  // let ribbons = useMouse((r) => r.ribbons)
  return (
    <>
      {hoverPlane}
      {stick}
      {cursor}
      {/* {ribbons} */}
    </>
  )
}

function SelectiveBloomRender() {
  let useStore = useMemo(() => {
    return create((set, get) => {
      return {
        postProcessingConfig: {
          multisampling: 2,
          emissiveIntensity: 1,
          envMapIntensity: 0.3,
          ssrPass: {
            useThisOne: false,
            intensity: 0.3,
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
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.5,
            intensity: 0.3,
            resolutionScale: 0.3,
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
            offsetX: 0.008,
            offsetY: 0.008,
            radialModulation: true,
            modulationOffset: 0.5,
          },
          colorPass: {
            useThisOne: true,
            hue: 0,
            satuation: 0,
            brightness: 0.25,
            contrast: 0.3,
            saturation: 0.15,
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
    </>
  )
}

// function Computer() {
//   let gltf = useGLTF(`/mini-homes/computer.glb`)
//   return <primitive object={gltf.scene} />
// }

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
