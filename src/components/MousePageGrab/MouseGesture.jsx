import {
  Environment,
  Icosahedron,
  OrbitControls,
  useGLTF,
  Text3D,
  PerspectiveCamera,
  Sphere,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import { useMouse } from './useMouse.js'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { DoubleSide, Vector3 } from 'three'
import { sceneToCollider } from './Noodle/sceneToCollider.js'
import { EnvSSRWorks } from './PostProcessing/EnvSSRWorks.jsx'
import { create } from 'zustand'
import anime from 'animejs'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { Ray, Matrix4, Sphere as Sphere3JS } from 'three'
import { useMouseCache } from './useMouseCache.jsx'

export function MouseGesture() {
  return (
    <>
      <group>
        <MathSymbol position={[0, 2, -4]} canDrag={false} left={'='} right='='></MathSymbol>

        <group name='groupCast'>
          <MathSymbol position={[-3, 2, -4]} left={'+ 1'} right='- 1'></MathSymbol>

          <MathSymbol position={[-8, 2, -4]} left={'+ 2x'} right='- 2x'></MathSymbol>

          <MathSymbol position={[3, 2, -4]} left={'+ 3'} right='- 3'></MathSymbol>

          <group position={[0, -3, -1]} userData={{ dragGroup: true }}>
            <Sphere scale={[2, 2, 0.5]} userData={{ noGlow: true }}>
              <MeshTransmissionMaterial
                backside={true}
                side={DoubleSide}
                backsideThickness={0.5}
                transmissionSampler={true}
                transmission={1}
                roughness={0.0}
                thickness={1.5}
                reflectivity={0.5}
                chromaticAberration={0.15}
                //
              ></MeshTransmissionMaterial>
            </Sphere>
          </group>
        </group>

        <PerspectiveCamera near={0.5} far={300} fov={76} makeDefault></PerspectiveCamera>

        <OrbitControls
          rotateSpeed={-1}
          object-position={[0, 1.6, 10]}
          target={[0, 1.6, 10 - 1]}
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          makeDefault
          enabled={false}></OrbitControls>

        <Hand></Hand>

        <Init></Init>

        <SelectiveBloomRender></SelectiveBloomRender>

        <Insert></Insert>

        <Vars></Vars>

        <Suspense fallback={null}>
          <Environment background files={`/envMap/poly_haven_studio_1k.hdr`}></Environment>
          <group rotation={[0, 0.5, 0]} position={[15, -10, -30]} scale={10}>
            <BG url={`/room/room-fancy.003.glb`}></BG>
          </group>
          <DragGUI></DragGUI>
        </Suspense>
      </group>
    </>
  )
}

function Vars() {
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
      <primitive object={camera}></primitive>
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
      {/*  */}
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

  // Checking boundingSphere distance to ray
  if (geometry.boundingSphere === null) geometry.computeBoundingSphere()
  _sphere.copy(geometry.boundingSphere)
  _sphere.radius = _sphere.radius
  _sphere.applyMatrix4(matrixWorld)
  if (raycaster.ray.intersectsSphere(_sphere) === false) return
  _inverseMatrix.copy(matrixWorld).invert()
  _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix)

  if (geometry.boundingBox !== null && _ray.intersectBox(geometry.boundingBox, _vA) === null)
    // Check boundingBox before continuing
    return

  if (!geometry.boundingBox) {
    geometry.computeBoundingBox()
  }
  if (!geometry.boundingBox.scaledUp) {
    geometry.boundingBox.scaledUp = true
    geometry.boundingBox.expandByScalar(geometry.boundingSphere.radius * 3)
  }
  intersects.push({
    distance: _vA.distanceTo(raycaster.ray.origin),
    point: _vA.clone(),
    object: this,
  })
}

function MathSymbol({ canDrag = true, position, left = '', right = '' }) {
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
        ref.current.rotation.z = 0
        anime({
          duration: 1000,
          targets: [ref.current.rotation],
          z: Math.PI * 2,
          easing: 'easeInOutQuad',
        })
        setSide(shouldBeSide)
      }
    }
    if (ref.current) {
      if (!ref.current.geometry.centered) {
        ref.current.centered = true
        ref.current.geometry.center()
      }
    }
  })

  return (
    <>
      <group position={position} userData={{ dragGroup: canDrag }}>
        <Text3D
          ref={ref}
          anchorX={'center'}
          anchorY={'middle'}
          size={1.5}
          textAlign='center'
          raycast={meshBounds}
          font={`/font/days_regular_macroman/Days_Regular.json`}>
          {side === 'left' && left}
          {side === 'right' && right}
          <meshStandardMaterial
            side={DoubleSide}
            roughness={0.15}
            metalness={1}
            color={'#0000ff'}></meshStandardMaterial>
        </Text3D>
      </group>
    </>
  )
}

function Insert() {
  let handsInsert = useMouse((r) => r.handsInsert)
  let hoverPlane = useMouse((r) => r.hoverPlane)
  return (
    <>
      {handsInsert}
      {hoverPlane}
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
          envMapIntensity: 1,

          aoPass: {
            useThisOne: true,
            intensity: 2,
            aoRadius: 1.9020000000000001,
            distanceFalloff: 2.5540000000000003,
            color: '#000000',
          },
          colorPass: {
            useThisOne: true,
            hue: 0,
            satuation: 0.3,
            brightness: -0.1,
            contrast: 0.1,
            saturation: 0.0,
          },
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

            //
            jitter: 0.125,
            jitterRoughness: 0.125,

            //
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
            luminanceThreshold: 0.5,
            intensity: 1,
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
        },
      }
    })
  }, [])

  return (
    <>
      <EnvSSRWorks isGame={true} useStore={useStore}></EnvSSRWorks>
    </>
  )
}

function BG({ url = `/teahouse/teahouse-opt-transformed.glb` }) {
  let gltf = useGLTF(url)

  useEffect(() => {
    if (!gltf?.scene) {
      return
    }
    if (useMouse.getState().collider) {
      return
    }

    if (useMouseCache.has('collider')) {
      useMouse.setState({ collider: useMouseCache.get('collider') })
      return
    }

    sceneToCollider({ scene: gltf.scene }).then((r) => {
      useMouse.setState({ collider: r })
      useMouseCache.set('collider', r)
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

    return () => {
      useMouse.getState().cleanMini()
    }
  }, [scene, gl, camera, collider, inited])

  return null
}

function Hand() {
  let bones = useMouse((r) => r.bones)
  return (
    <group>
      {bones.map((r) => {
        return (
          <group key={r.uuid}>
            <OneHand bone={r}></OneHand>
          </group>
        )
      })}
    </group>
  )
}

function OneHand({ bone }) {
  let ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.position.lerp(bone.position, 0.25)
      ref.current.visible = bone.visible
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
