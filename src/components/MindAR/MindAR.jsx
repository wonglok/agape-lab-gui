import { useEffect, useRef, useState } from 'react'
import {
  Box3,
  CylinderGeometry,
  EquirectangularReflectionMapping,
  FloatType,
  MeshPhysicalMaterial,
  Vector3,
} from 'three'
import { BoxGeometry, Object3D } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three147'
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
        imageTargetSrc: `/2023/06/agape-ar-target/white/targets.mind`,
        uiScanning: false,
        uiLoading: false,
        uiError: false,
      })

      const { renderer, scene, camera } = mindarThree

      const rgbe = new RGBELoader()
      rgbe.setDataType(FloatType)
      rgbe.loadAsync(`/envMap/evening_road_01_puresky_1k.hdr`).then((tex) => {
        tex.mapping = EquirectangularReflectionMapping
        scene.environment = tex
      })

      const anchor = mindarThree.addAnchor(0)
      const geometry = new PlaneGeometry(1, 852 / 2896)
      const material = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
      const plane = new Mesh(geometry, material)

      let objectGrouper = new Object3D()
      let volumeMesh = new Mesh(
        new BoxGeometry(0.5, 0.5, 0.5),
        new MeshStandardMaterial({ color: '#ffffff', roughness: 0, wireframe: true }),
      )

      let box3 = new Box3()
      box3.expandByObject(volumeMesh)
      let groupSizer = new Vector3()
      box3.getSize(groupSizer)
      objectGrouper.add(volumeMesh)
      objectGrouper.position.set(0, 0, groupSizer.z / 2)

      anchor.group.add(objectGrouper)

      anchor.group.add(plane)

      const start = async () => {
        await mindarThree.start()
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera)
        })
      }

      const stop = async () => {
        cancelAnimationFrame(rAFID)
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
          <img className=' h-14' src={`/2023/06/agape-ar-target/white/agape-white.png`}></img>
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
