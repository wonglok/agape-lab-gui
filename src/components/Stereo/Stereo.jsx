import { Box, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { StereoEffect } from 'three-stdlib'
import { Color } from 'three'
import { Content } from './Content'

export function Stereo() {
  let container = useRef()
  return (
    <>
      {/*  */}
      <div className='flex items-center justify-center w-full h-full bg-black'>
        <div className=' w-full h-full bg-white' ref={container}>
          <Canvas>
            {/*  */}

            <EyeAdapter
              onSize={(size) => {
                container.current.style.width = `${size.width}px`
                container.current.style.height = `${size.height}px`
              }}></EyeAdapter>

            <Content></Content>
          </Canvas>
        </div>
      </div>

      {/*  */}
    </>
  )
}

function EyeAdapter({ onSize }) {
  let size = useThree((r) => r.size)
  let gl = useThree((r) => r.gl)

  let ef = useMemo(() => {
    return new StereoEffect(gl)
  }, [gl])

  useEffect(() => {
    ef.setSize(size.width, size.height)
    onSize(size)
  }, [size, ef, onSize])

  useEffect(() => {
    ef.setEyeSeparation(0.005 * 50)
  }, [ef])

  useFrame(({ scene, size, camera }) => {
    camera.aspect = (size.width / size.height) * 2
    camera.updateProjectionMatrix()
    ef.render(scene, camera)
  }, 10000)

  return <></>
}

//
