import { useEffect, useRef, useState } from 'react'
import {
  AnimationMixer,
  Box3,
  Clock,
  CylinderGeometry,
  EquirectangularReflectionMapping,
  FloatType,
  GridHelper,
  MeshPhysicalMaterial,
  Vector3,
} from 'three'
import { BoxGeometry, Object3D } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
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
    import('mind-ar/dist/mindar-image-three.prod.js').then(async ({ MindARThree }) => {
      let mindarThree = new MindARThree({
        container: container.current,
        imageTargetSrc: `/2023/06/agape-ar-target/jesus/targets.mind`,
        // imageTargetSrc: `/2023/06/agape-ar-target/white/targets.mind`,
        uiScanning: false,
        uiLoading: false,
        uiError: false,
      })

      const { renderer, scene, camera } = mindarThree

      const rgbe = new RGBELoader()
      rgbe.loadAsync(`/envMap/evening_road_01_puresky_1k.hdr`).then((tex) => {
        tex.mapping = EquirectangularReflectionMapping
        scene.environment = tex
      })

      const anchor = mindarThree.addAnchor(0)

      // const geometry = new PlaneGeometry(1, 852 / 2896)
      // const material = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
      // const plane = new Mesh(geometry, material)
      // anchor.group.add(plane)

      let objectGrouper = new Object3D()

      let tj = `/thankyou-jesus/tj3b.glb`
      let glbLoader = new GLTFLoader()
      let draco = new DRACOLoader()
      draco.setDecoderPath(`/draco`)
      glbLoader.setDRACOLoader(draco)
      let fbxLoader = new FBXLoader()
      let gltf = await glbLoader.loadAsync(tj)
      let motions = {
        mixer: new AnimationMixer(),
        get: async (name, url) => {
          let clip = (await fbxLoader.loadAsync(url)).animations[0]
          motions[name] = motions.mixer.clipAction(clip, gltf.scene)
        },
      }
      await motions.get('happy', `/thankyou-jesus/motion/Waving-Gesture.fbx`)

      let setup = ({ gltf, motions }) => {
        let autoScale = new Object3D()

        autoScale.add(gltf.scene)

        let box3 = new Box3()
        box3.setFromObject(gltf.scene)
        let autoSize = new Vector3()
        box3.getSize(autoSize)

        autoScale.scale.setScalar(0.5 / autoSize.length())

        let grid = new GridHelper(1, 10, 0x00ffff, 0x00ffff)
        objectGrouper.add(grid)
        objectGrouper.add(autoScale)

        motions.mixer.clipAction(gltf.animations[0], gltf.scene).play()
      }

      setup({ gltf, motions })
      anchor.group.add(objectGrouper)

      const start = async () => {
        await mindarThree.start()
        let clock = new Clock()
        renderer.setAnimationLoop(() => {
          let dt = clock.getDelta()
          motions.mixer.update(dt)
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
          <img className='m-2 h-14' src={`/2023/06/agape-ar-target/white/agape-white.png`}></img>
          <img className='m-2 w-14' src={`/2023/06/agape-ar-target/jesus/thankyouJESUS.jpg`} />
        </div>
        <button
          className='p-2 m-1 bg-gray-100 rounded-lg'
          onClick={() => {
            start()
          }}>
          Start AR
        </button>
        <button
          className='p-2 m-1 bg-gray-100 rounded-lg'
          onClick={() => {
            stop()
          }}>
          Stop
        </button>
      </div>
    </div>
  )
}
