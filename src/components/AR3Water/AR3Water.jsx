import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { useAR } from './useAR'
import { ParticleRelay } from './ParticleEngine/CoreEngine'
import { Environment } from '@react-three/drei'

export function AR3Water() {
  let refContainer = useRef()
  let refOverlay = useRef()
  let onStart = useAR((r) => r.onStart)
  let showStartMenu = useAR((r) => r.showStartMenu)
  let addObjectAt = useAR((r) => r.addObjectAt)
  let alva = useAR((r) => r.alva)
  let scene = useAR((r) => r.scene)
  let loading = useAR((r) => r.loading)

  return (
    <div className='w-full h-full '>
      {/*  */}

      <div className='relative w-full h-full' id='vidContainer' ref={refContainer}>
        <canvas id='vidCanvas' className='absolute top-0 left-0 w-full h-full'></canvas>
        <div
          onClick={(ev) => {
            //
            // let x = ev.clientX
            // let y = ev.clientY
            // addObjectAt(x, y, 0.5)
          }}
          className='absolute top-0 left-0 w-full h-full'>
          <Canvas>
            <ARContent></ARContent>
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
              {loading ? `Loading...` : `Start`}
            </button>
          }
        </div>
      )}

      {/*  */}
    </div>
  )
}

function ARContent() {
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
  return (
    <group>
      {/* <group position={[0, 0, -10.0]}>
        <primitive object={camera}></primitive>
      </group> */}
      <Environment files={`/envMap/evening_road_01_puresky_1k.hdr`}></Environment>
      <group position={[0, 0, -0.01]}>
        <ParticleRelay></ParticleRelay>
      </group>

      {ground && <primitive object={ground}></primitive>}
    </group>
  )
}
