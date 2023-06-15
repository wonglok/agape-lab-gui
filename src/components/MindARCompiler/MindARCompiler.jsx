import { bu } from 'mind-ar/dist/controller-495b585f'
import nProgress from 'nprogress'
import { useEffect, useRef, useState } from 'react'
import {
  AnimationMixer,
  Box3,
  Clock,
  CylinderGeometry,
  EquirectangularReflectionMapping,
  FloatType,
  GridHelper,
  HalfFloatType,
  MeshPhysicalMaterial,
  Vector3,
} from 'three'
import { BoxGeometry, Object3D } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
// import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three147'
import { create } from 'zustand'
// import * as MindARCore from
// console.log(MindARCore)

export const useMindAR = create((set, get) => {
  return {
    //
    progress: 0,
    start: () => {},
    stop: () => {},
  }
})

export function MindARCompiler() {
  let container = useRef()
  let compile = ({ fileURL }) => {
    Promise.all([
      //
      import('mind-ar/dist/mindar-image-three.prod.js'),
      import('mind-ar/dist/mindar-image.prod.js'),
    ]).then(
      async ([
        //
        { MindARThree },
        { Compiler },
      ]) => {
        let compiler = new Compiler()

        let images = await Promise.all(
          [fileURL].map((r) => {
            return new Promise((resolve) => {
              let img = new Image()
              img.onload = () => resolve(img)
              img.src = r
            })
          }),
        )

        await compiler.compileImageTargets(images, (progress) => {
          let pr = 'Loading...' + progress.toFixed(2) + '%'
          console.log(pr)

          useMindAR.setState({ progress: pr })
          if (progress === 100) {
            useMindAR.setState({ progress: 'Start AR' })
          }
        })

        const exportedBuffer = await compiler.exportData()

        const url = URL.createObjectURL(new Blob([exportedBuffer], { type: 'application/octet-stream' }))

        // console.log(url)

        let mindarThree = new MindARThree({
          container: container.current,
          // imageTargetSrc: `/2023/06/agape-ar-target/jesus/targets.mind`,
          imageTargetSrc: url, // `/2023/06/agape-ar-target/white/targets.mind`,
          uiScanning: false,
          uiLoading: false,
          uiError: false,
        })

        const { renderer, scene, camera } = mindarThree

        const rgbe = new RGBELoader()
        rgbe.setDataType(HalfFloatType)
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
          mindarThree.renderer.setAnimationLoop(null)
          mindarThree.stop()
        }

        useMindAR.setState({ start, stop })
        //
      },
    )
  }
  useEffect(() => {
    compile({ fileURL: `/2023/06/agape-ar-target/white/agape-white.png` })
  }, [])

  let stop = useMindAR((r) => r.stop)
  let start = useMindAR((r) => r.start)
  let progress = useMindAR((r) => r.progress)
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
            let inp = document.createElement('input')
            inp.type = 'file'
            inp.capture = 'environment'
            inp.accept = 'image/*'
            inp.onchange = (e) => {
              console.log()

              compile({ fileURL: URL.createObjectURL(e.target.files[0]) })
            }
            inp.click()
          }}>
          Use Other
        </button>
        <button
          className='p-2 m-1 bg-gray-100 rounded-lg'
          onClick={() => {
            nProgress.start()
            setTimeout(() => {
              start()
              nProgress.done()
            }, 1000)
          }}>
          {progress}
        </button>
        <button
          className='p-2 m-1 bg-gray-100 rounded-lg'
          onClick={() => {
            stop()
          }}>
          Stop
        </button>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: /* css */ `
      /* Make clicks pass-through */
#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  background: #29d;

  position: fixed;
  z-index: 1031;
  top: 0;
  left: 0;

  width: 100%;
  height: 2px;
}

/* Fancy blur effect */
#nprogress .peg {
  display: block;
  position: absolute;
  right: 0px;
  width: 100px;
  height: 100%;
  box-shadow: 0 0 10px #29d, 0 0 5px #29d;
  opacity: 1.0;

  -webkit-transform: rotate(3deg) translate(0px, -4px);
      -ms-transform: rotate(3deg) translate(0px, -4px);
          transform: rotate(3deg) translate(0px, -4px);
}

/* Remove these to get rid of the spinner */
#nprogress .spinner {
  display: block;
  position: fixed;
  z-index: 1031;
  top: 15px;
  right: 15px;
}

#nprogress .spinner-icon {
  width: 18px;
  height: 18px;
  box-sizing: border-box;

  border: solid 2px transparent;
  border-top-color: #29d;
  border-left-color: #29d;
  border-radius: 50%;

  -webkit-animation: nprogress-spinner 400ms linear infinite;
          animation: nprogress-spinner 400ms linear infinite;
}

.nprogress-custom-parent {
  overflow: hidden;
  position: relative;
}

.nprogress-custom-parent #nprogress .spinner,
.nprogress-custom-parent #nprogress .bar {
  position: absolute;
}

@-webkit-keyframes nprogress-spinner {
  0%   { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}
@keyframes nprogress-spinner {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

      `,
        }}></style>
    </div>
  )
}
