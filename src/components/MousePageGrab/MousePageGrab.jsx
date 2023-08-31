import { Canvas } from '@react-three/fiber'
import { MouseGesture } from './MouseGesture'
import { useMouse } from './useMouse.js'
import { Stats } from '@react-three/drei'
import { useEffect, useRef } from 'react'
// import { useEffect } from 'react'
export function MousePageGrab() {
  let showStartMenu = useMouse((r) => r.showStartMenu)
  let video = useMouse((r) => r.video)
  let loading = useMouse((r) => r.loading)
  // let scene = useMouse((r) => r.scene)
  // let camera = useMouse((r) => r.camera)
  // let controls = useMouse((r) => r.controls)
  // useEffect(() => {
  //   if (showStartMenu && scene && camera && controls) {
  //     useMouse.getState().initVideo()
  //     useMouse.getState().initTask()
  //   }
  // }, [showStartMenu, scene, camera, controls])

  return (
    <>
      <Canvas
        onCreated={(st) => {
          st.gl.domElement.ontouchstart = (ev) => {
            ev.preventDefault()
          }
          st.gl.domElement.ontouchmove = (ev) => {
            ev.preventDefault()
          }
        }}>
        <Stats></Stats>

        <MouseGesture></MouseGesture>
      </Canvas>

      {showStartMenu && (
        <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
          {
            <button
              className='p-2 bg-gray-200'
              // onClick={() => {
              //   useMouse.getState().initVideo()
              //   useMouse.getState().initTask()
              // }}
            >
              {loading ? `Processing...` : `Downloading....`}
            </button>
          }
        </div>
      )}

      {video && (
        <div className='absolute top-0 right-0'>
          <InsertV dom={video}></InsertV>
        </div>
      )}
    </>
  )
}

function InsertV({ dom }) {
  let ref = useRef()
  useEffect(() => {
    let target = ref.current
    ref.current.appendChild(dom)
    return () => {
      target.innerHTML = ''
    }
  }, [dom])
  return <div className='w-36 -scale-x-100' ref={ref}></div>
}
