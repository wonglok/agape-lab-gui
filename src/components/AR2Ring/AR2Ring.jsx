import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useAR } from './useAR'
import {
  Circle,
  CubeCamera,
  Cylinder,
  Environment,
  MeshReflectorMaterial,
  MeshRefractionMaterial,
  MeshTransmissionMaterial,
  useCubeCamera,
  useEnvironment,
  useGLTF,
} from '@react-three/drei'
import { Color, MeshBasicMaterial } from 'three147'

export function AR2Ring() {
  let refContainer = useRef()
  let refOverlay = useRef()
  let onStart = useAR((r) => r.onStart)
  let showStartMenu = useAR((r) => r.showStartMenu)
  let addObjectAt = useAR((r) => r.addObjectAt)
  let alva = useAR((r) => r.alva)
  let scene = useAR((r) => r.scene)

  return (
    <div className='w-full h-full '>
      {/*  */}
      {/*  */}

      <div className='relative w-full h-full' id='vidContainer' ref={refContainer}>
        <canvas id='vidCanvas' className='absolute top-0 left-0 w-full h-full'></canvas>
        <div
          onClick={(ev) => {
            // //
            // let x = ev.clientX
            // let y = ev.clientY
            // addObjectAt(x, y, 0.5)
            addObjectAt()
          }}
          className='absolute top-0 left-0 w-full h-full'>
          <Canvas>
            <ARContent></ARContent>
            <Cursor></Cursor>
          </Canvas>
        </div>

        <div className=' absolute top-0 right-0'>
          {alva && (
            <button
              className='p-2 bg-gray-300'
              onClick={() => {
                alva.reset()
                let list = []
                scene.traverse((it) => {
                  if (it.custom) {
                    list.push(it)
                  }
                })
                list.forEach((it) => {
                  it.removeFromParent()
                })
                useAR.setState({ useIMU: true })
              }}>
              Reset
            </button>
          )}
        </div>
      </div>
      {/*  */}
      {showStartMenu && (
        <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full' ref={refOverlay}>
          {
            <button
              className='p-2 bg-gray-200'
              onClick={() => {
                onStart()
              }}>
              Start
            </button>
          }
        </div>
      )}

      {/*  */}
    </div>
  )
}

function Cursor() {
  let ref = useRef()
  let ground = useAR((r) => r.ground)
  let cursor = useAR((r) => r.cursor)
  useFrame(({ raycaster, camera }) => {
    if (ground) {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera)

      let res = raycaster.intersectObject(ground, false)
      res = res || []
      let first = res[0]
      if (first) {
        // console.log(first.point)

        if (ref.current) {
          ref.current.position.copy(first.point)
          cursor.position.copy(first.point)
        }
      }
    }
  })

  //
  return (
    <Cylinder ref={ref} args={[0.5, 0.5, 0.05, 32, 32]}>
      {/*  */}
      {/*  */}
      <MeshTransmissionMaterial samples={5} thickness={1.5} roughness={0.2}></MeshTransmissionMaterial>
      {/*  */}
    </Cylinder>
  )
}

function ARContent() {
  let ringGLB = useGLTF(`/2023/05/03/ar-ring/diamond.glb`)
  let ring = useAR((r) => r.ring)
  let onFrame = useAR((r) => r.onFrame)

  let scene = useThree((r) => r.scene)
  let camera = useThree((r) => r.camera)
  let gl = useThree((r) => r.gl)

  let ground = useAR((r) => r.ground)

  useAR.setState({ renderer: gl, camera, scene })

  useFrame(({ camera }) => {
    if (onFrame) {
      onFrame({ camera })
    }
  })

  ring.scale.setScalar(10)
  let [mat, setMat] = useState(null)

  let envMap = useEnvironment({ preset: 'apartment' })
  let cubeCam = useCubeCamera({ resolution: 512, envMap: envMap, near: 0.1, far: 1000, position: [0, 0, 0] })
  useFrame(() => {
    cubeCam.update()
  })
  useEffect(() => {
    //
    setMat(
      <MeshRefractionMaterial
        bounces={5}
        ior={2.4}
        fresnel={0}
        aberrationStrength={0.1}
        fastChroma
        envMap={cubeCam.fbo.texture}
      />,
    )

    //

    //

    // ringGLB.scene.getObjectByName('Diamond').material = new MeshBasicMaterial({ color: new Color('#00ff00') })
  }, [cubeCam, ringGLB.scene])
  return (
    <group>
      {ringGLB && (
        <>
          {mat && createPortal(mat, ringGLB.scene.getObjectByName('Diamond'))}

          {createPortal(<primitive object={ringGLB.scene}></primitive>, ring)}
          {/* <primitive object={ring}></primitive> */}
        </>
      )}

      {/* <group position={[0, 0, -3]}>
        <primitive object={ring}></primitive>
      </group> */}

      {/*  */}

      <Environment preset='apartment'></Environment>
      {/*  */}
      {/* {ground && <primitive object={ground}></primitive>} */}
    </group>
  )
}
