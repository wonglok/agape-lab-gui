import { an, bu, ca } from 'mind-ar/dist/controller-495b585f'
import nProgress from 'nprogress'
import { useEffect, useRef, useState } from 'react'
import {
  AnimationMixer,
  Box3,
  Camera,
  Clock,
  CylinderGeometry,
  EquirectangularReflectionMapping,
  FloatType,
  GridHelper,
  HalfFloatType,
  Matrix4,
  MeshPhysicalMaterial,
  Quaternion,
  Vector3,
  sRGBEncoding,
} from 'three'
import { BoxGeometry, Object3D } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture } from 'three147'
// import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three147'
import { create } from 'zustand'
// import * as MindARCore from
// console.log(MindARCore)

export const useMindAR = create((set, get) => {
  return {
    //
    progress: 0,
    start: false,
    stop: () => {},
  }
})

export function MindARCompiler() {
  let container = useRef()
  let compile = ({ fileURL, autoStart = false }) => {
    nProgress.start()
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

        let aspect = 1
        let images = await Promise.all(
          [fileURL].map((r) => {
            return new Promise((resolve) => {
              let img = new Image()
              img.onload = () => {
                let canvas = document.createElement('canvas')
                canvas.width = 512
                canvas.height = (512 / img.width) * img.height

                aspect = canvas.width / canvas.height

                let ctx = canvas.getContext('2d')

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                let src = canvas.toDataURL('png', 0.5)

                let img2 = new Image()
                img2.onload = () => {
                  resolve(img2)
                }
                img2.src = src
              }
              img.src = r
            })
          }),
        )

        await compiler.compileImageTargets(images, (progress) => {
          let pr = '' + progress.toFixed(2) + '%'
          useMindAR.setState({ progress: pr })
          if (progress === 100) {
            useMindAR.setState({ progress: 'Finishing up...' })
          }
        })

        const exportedBuffer = await compiler.exportData()

        const url = URL.createObjectURL(new Blob([exportedBuffer], { type: 'application/octet-stream' }))

        container.current.style.width = window.innerWidth + 'px'
        container.current.style.height = window.innerHeight + 'px'

        let mindarThree = new MindARThree({
          container: container.current,
          imageTargetSrc: url, // `/2023/06/agape-ar-target/white/targets.mind`,
          uiScanning: true,
          uiLoading: true,
          uiError: true,
        })

        const { renderer, scene, camera } = mindarThree

        const rgbe = new RGBELoader()
        rgbe.setDataType(HalfFloatType)
        rgbe.loadAsync(`/envMap/evening_road_01_puresky_1k.hdr`).then((tex) => {
          tex.mapping = EquirectangularReflectionMapping
          scene.environment = tex
        })

        const geometry = new PlaneGeometry(1, 1 / aspect)
        const material = new MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
        const plane = new Mesh(geometry, material)

        const anchor = mindarThree.addAnchor(0)
        anchor.group.add(plane)

        let tj = `/thankyou-jesus/tj3b.glb`
        let glbLoader = new GLTFLoader()
        let draco = new DRACOLoader()
        draco.setDecoderPath(`/draco`)
        glbLoader.setDRACOLoader(draco)
        let fbxLoader = new FBXLoader()
        let gltf = await glbLoader.loadAsync(tj)
        let motions = {
          mixer: new AnimationMixer(gltf.scene),
          get: async (name, url) => {
            let clip = (await fbxLoader.loadAsync(url)).animations[0]
            motions[name] = motions.mixer.clipAction(clip, gltf.scene)
          },
        }

        // await motions.get('happy', `/thankyou-jesus/motion/Waving-Gesture.fbx`)

        const start = async () => {
          useMindAR.setState({ start: () => {} })
          motions.mixer.clipAction(gltf.animations[0], gltf.scene).play()

          await mindarThree.start()

          let position = new Vector3()
          let quaternion = new Quaternion()
          let scale = new Vector3()

          let position2 = new Vector3()
          let quaternion2 = new Quaternion()
          let scale2 = new Vector3()

          mindarThree.controller.onUpdate = (n) => {
            if (n.type === 'updateMatrix') {
              let dat = mindarThree
              const { targetIndex: o, worldMatrix: u } = n
              for (let p = 0; p < dat.anchors.length; p++)
                if (dat.anchors[p].targetIndex === o) {
                  if (
                    (dat.anchors[p].css
                      ? dat.anchors[p].group.children.forEach((m) => {
                          m.element.style.visibility = u === null ? 'hidden' : 'visible'
                        })
                      : (dat.anchors[p].group.visible = u !== null),
                    u !== null)
                  ) {
                    let m = new Matrix4()
                    m.elements = [...u]
                    m.multiply(dat.postMatrixs[o])

                    dat.anchors[p].css && m.multiply(ui)

                    m.decompose(position, quaternion, scale)

                    position2.lerp(position, 0.3)
                    quaternion2.slerp(quaternion, 0.3)
                    scale2.lerp(scale, 0.3)

                    // let lerpM = new Matrix4()
                    // lerpM

                    dat.anchors[p].group.matrix.compose(position2, quaternion2, scale2)
                  } else {
                    dat.anchors[p].group.matrix.identity()
                  }
                  dat.anchors[p].visible &&
                    u === null &&
                    ((dat.anchors[p].visible = !1), dat.anchors[p].onTargetLost && dat.anchors[p].onTargetLost()),
                    !dat.anchors[p].visible &&
                      u !== null &&
                      ((dat.anchors[p].visible = !0), dat.anchors[p].onTargetFound && dat.anchors[p].onTargetFound()),
                    dat.anchors[p].onTargetUpdate && dat.anchors[p].onTargetUpdate()
                }
              dat.anchors.reduce((p, m) => p || m.visible, !1) ? dat.ui.hideScanning() : dat.ui.showScanning()
            }
          }

          let clock = new Clock()

          let autoScale = new Object3D()

          autoScale.add(gltf.scene)

          // gltf.scene.scale.setScalar(0.5)
          let box3 = new Box3()
          box3.setFromObject(gltf.scene)
          let autoSize = new Vector3()
          box3.getSize(autoSize)

          autoScale.scale.setScalar((1 / autoSize.length()) * 1.4)

          let offset = new Object3D()
          offset.add(autoScale)

          offset.position.y = (1 / aspect / 2) * -1
          offset.position.z += autoSize.z / 2

          let lerp = new Object3D()
          lerp.add(offset)

          anchor.group.add(lerp)

          let update = () => {
            let dt = clock.getDelta()
            motions.mixer.update(dt)
          }

          let videoEl = mindarThree.container.querySelector('video')

          videoEl.style.objectFit = 'cover'
          videoEl.style.top = '0px'
          videoEl.style.left = '0px'
          videoEl.style.width = `${window.innerWidth}px`
          videoEl.style.height = `${window.innerHeight}px`

          setTimeout(() => {
            useMindAR.setState({ noGUI: true })
          })

          renderer.setAnimationLoop(() => {
            update()
            //
            renderer.render(scene, camera)
          })
        }

        const stop = async () => {
          mindarThree.renderer.setAnimationLoop(null)
          mindarThree.stop()
        }

        useMindAR.setState({ start, stop, progress: '' })

        if (autoStart) {
          start()
        }
        nProgress.done()
        //
      },
    )
  }

  useEffect(() => {
    compile({ fileURL: `/2023/06/agape-ar-target/jesus/thankyouJESUS.jpg`, autoStart: false })
  }, [])

  let stop = useMindAR((r) => r.stop)
  let start = useMindAR((r) => r.start)
  let progress = useMindAR((r) => r.progress)
  let noGUI = useMindAR((r) => r.noGUI)

  return (
    <>
      <div ref={container} className=''></div>
      <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
        {!noGUI && start && (
          <button
            className='p-2 m-1 bg-blue-300 rounded-2xl'
            onClick={() => {
              // start()
              // // let input = document.createElement('input')
              // // input.type = 'file'
              // // input.onchange = () => {
              // //   let file = input.files[0]
              // //   compile({ fileURL: `${URL.createObjectURL(file)}`, autoStart: true })
              // // }
              // // input.click()

              start()

              // compile({ fileURL: `/2023/06/agape-ar-target/white/agape-white.png`, autoStart: false })
            }}>
            Start
          </button>
        )}
        {progress}
        <img className='w-40' src={`/2023/06/agape-ar-target/jesus/thankyouJESUS.jpg`}></img>
      </div>
    </>
  )
}
