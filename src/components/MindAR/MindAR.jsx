import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three147'
import { create } from 'zustand'
// import * as MindARCore from

// console.log(MindARCore)

export const useMindAR = create((set, get) => {
  return {
    //
    start: () => {},
    stop: () => {},
  }
})
export function MindAR() {
  let container = useRef()

  useEffect(() => {
    import('mind-ar/dist/mindar-image-three.prod.js').then(({ MindARThree }) => {
      let mindarThree = new MindARThree({
        container: container.current,
        imageTargetSrc: `/2023/06/agape-ar-target/agape-target.mind`,
        uiScanning: false,
        uiLoading: false,
        uiError: false,
      })

      const { renderer, scene, camera } = mindarThree
      const anchor = mindarThree.addAnchor(0)
      const geometry = new PlaneGeometry(1, 0.55)
      const material = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
      const plane = new Mesh(geometry, material)
      anchor.group.add(plane)
      anchor.onTargetUpdate = (target) => {
        console.log(target)
      }

      const start = async () => {
        await mindarThree.start()
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera)
        })
      }

      const stop = async () => {
        mindarThree.stop()
        mindarThree.renderer.setAnimationLoop(null)
      }

      useMindAR.setState({ start, stop })
      //
    })
  }, [])

  let stop = useMindAR((r) => r.stop)
  let start = useMindAR((r) => r.start)
  return (
    <div className='relative w-full h-full'>
      <div ref={container} className='absolute top-0 left-0 w-full h-full'></div>
      <div className=' absolute top-0 left-0'>
        <div>
          <img className=' h-14' src={`/2023/06/agape-ar-target/Agape_logo.png`}></img>
        </div>
        <button
          onClick={() => {
            start()
          }}>
          Start AR
        </button>
        <button
          onClick={() => {
            stop()
          }}>
          Stop
        </button>
      </div>
    </div>
  )
}
