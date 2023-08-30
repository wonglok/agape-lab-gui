// import { an, bu, ca } from 'mind-ar/dist/controller-495b585f'
import nProgress from 'nprogress'
import { useEffect, useRef, useState } from 'react'
import {
  AnimationMixer,
  BackSide,
  Box3,
  Camera,
  CircleGeometry,
  Clock,
  CylinderGeometry,
  DoubleSide,
  EquirectangularReflectionMapping,
  FloatType,
  GridHelper,
  HalfFloatType,
  Matrix4,
  MeshPhysicalMaterial,
  Quaternion,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
  sRGBEncoding,
} from 'three'
import { BoxGeometry, Object3D } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { Mesh, MeshBasicMaterial, PlaneGeometry, VideoTexture } from 'three'
// import { Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three147'
import { create } from 'zustand'
import { Canvas, createPortal, useFrame } from '@react-three/fiber'
import { Box, Environment, Stats } from '@react-three/drei'
// import { EnergySpa } from '../EnergySpa/EnergySpa'
// import { EnergySpaYo } from '../EnergySpaYo/EnergySpaYo'
// import { PPSwitch } from 'agape-sdk/src/main'
// import { useStore } from './useStore'
// import { OfflineLoader } from './data/OfflineLoader'
import { Bloom, DepthOfField, EffectComposer, SelectiveBloom, Texture } from '@react-three/postprocessing'
// import { TextureEffect } from 'postprocessing'
import * as QRCode from 'qrcode'
// import { EnergySpaFa } from '../EnergySpaFa/EnergySpaFa'
import { useMindAR } from './useMindAR'
// import * as MindARCore from
// console.log(MindARCore)

export function MindARCompilerHologram() {
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
                canvas.width = 256
                canvas.height = (256 / img.width) * img.height

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

        // const rgbe = new RGBELoader()
        // rgbe.setDataType(HalfFloatType)
        // rgbe.loadAsync(`/agape-sdk/hdr/concret.hdr`).then((tex) => {
        //   tex.mapping = EquirectangularReflectionMapping
        //   scene.environment = tex
        // })

        const geometry = new SphereGeometry(4, 24)
        const material = new MeshBasicMaterial({
          color: 0x333333,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
          depthTest: false,
          side: DoubleSide,
        })
        const plane = new Mesh(geometry, material)
        plane.frustumCulled = false

        const anchor = mindarThree.addAnchor(0)
        anchor.group.add(plane)

        useMindAR.setState({ anchorGroup: anchor.group, plane: null, camera, renderer, scene })

        // let tj = `/thankyou-jesus/tj3b.glb`
        // let glbLoader = new GLTFLoader()
        // let draco = new DRACOLoader()
        // draco.setDecoderPath(`/draco`)
        // glbLoader.setDRACOLoader(draco)
        // let fbxLoader = new FBXLoader()
        // let gltf = await glbLoader.loadAsync(tj)
        // let motions = {
        //   mixer: new AnimationMixer(gltf.scene),
        //   get: async (name, url) => {
        //     let clip = (await fbxLoader.loadAsync(url)).animations[0]
        //     motions[name] = motions.mixer.clipAction(clip, gltf.scene)
        //   },
        // }

        // await motions.get('happy', `/thankyou-jesus/motion/Waving-Gesture.fbx`)

        const start = async () => {
          useMindAR.setState({ start: () => {} })
          // motions.mixer.clipAction(gltf.animations[0], gltf.scene).play()

          await mindarThree.start()

          let position = new Vector3()
          let quaternion = new Quaternion()
          let scale = new Vector3()

          let position2 = new Vector3()
          let quaternion2 = new Quaternion()
          let scale2 = new Vector3()

          let m = new Matrix4()

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
                    m.identity()
                    m.elements = [...u]
                    m.multiply(dat.postMatrixs[o])

                    dat.anchors[p].css && m.multiply(ui)

                    m.decompose(position, quaternion, scale)

                    position2.lerp(position, 0.3)
                    quaternion2.slerp(quaternion, 0.3)
                    scale2.lerp(scale, 0.3)

                    position2.y += 0.1

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

          // let clock = new Clock()

          // let autoScale = new Object3D()

          // autoScale.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0xff0000 })))

          // autoScale.add(gltf.scene)

          // // gltf.scene.scale.setScalar(0.5)
          // let box3 = new Box3()
          // box3.setFromObject(gltf.scene)
          // let autoSize = new Vector3()
          // box3.getSize(autoSize)

          // autoScale.scale.setScalar((1 / autoSize.length()) * 1.4)

          // let offset = new Object3D()
          // offset.add(autoScale)

          // offset.position.y = (1 / aspect / 2) * -1
          // offset.position.z += autoSize.z / 2

          // let lerp = new Object3D()
          // lerp.add(offset)

          // anchor.group.add(lerp)

          // let update = () => {
          //   let dt = clock.getDelta()
          //   // motions.mixer.update(dt)
          // }

          let videoEl = mindarThree.container.querySelector('video')

          videoEl.style.objectFit = 'cover'
          videoEl.style.top = '0px'
          videoEl.style.left = '0px'
          videoEl.style.width = `${window.innerWidth}px`
          videoEl.style.height = `${window.innerHeight}px`

          setTimeout(() => {
            let vt = new VideoTexture(videoEl)

            useMindAR.setState({ noGUI: true, videoEl: videoEl, videoTexture: vt })
          })

          // renderer.setAnimationLoop(() => {
          //   update()
          //   //
          //   // renderer.render(scene, camera)
          // })
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
    //
    QRCode.toDataURL(location.href, (err, url) => {
      if (err) {
        console.log(err)
        return
      }

      url = `/dancer/patricia-palma-OaAB-eYwmUU-unsplash.jpg`
      useMindAR.setState({ qrCode: url })
      compile({ fileURL: url, autoStart: false })
    })
  }, [])

  let stop = useMindAR((r) => r.stop)
  let start = useMindAR((r) => r.start)
  let progress = useMindAR((r) => r.progress)
  let noGUI = useMindAR((r) => r.noGUI)

  let scene = useMindAR((r) => r.scene)
  let anchorGroup = useMindAR((r) => r.anchorGroup)
  let videoEl = useMindAR((r) => r.videoEl)
  let videoTexture = useMindAR((r) => r.videoTexture)
  let qrCode = useMindAR((r) => r.qrCode)

  let meshRef = useRef()
  return (
    <>
      <div ref={container} className='relative hidden w-full h-full'></div>
      <Canvas eventSource={container} className='absolute top-0 left-0'>
        {videoEl && (
          <videoTexture
            encoding={sRGBEncoding}
            colorSpace={SRGBColorSpace}
            args={[videoEl]}
            attach={'background'}
            // repeat={[1, 1]}
          ></videoTexture>
        )}

        {scene && <primitive object={scene} />}

        {anchorGroup &&
          createPortal(
            <group position={[0.0, 0, 0]}>
              <Box></Box>

              <group frustumCulled={false} rotation={[Math.PI * 0.0, 0, 0]} scale={0.08}>
                {/* <EnergySpa meshRef={meshRef}></EnergySpa> */}
                {/* <EnergySpaFa meshRef={meshRef}></EnergySpaFa> */}
                {/* <EnergySpaYo meshRef={meshRef}></EnergySpaYo> */}
              </group>
            </group>,
            anchorGroup,
          )}
        {/* <OfflineLoader useStore={useStore}></OfflineLoader>
          <PPSwitch useStore={useStore}></PPSwitch> */}
        <CamSync></CamSync>
        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom intensity={7} luminanceThreshold={0.5} mipmapBlur={true}></Bloom>
          {/* <DepthOfField></DepthOfField> */}
          {/* <SelectiveBloom luminanceThreshold={0.3} mipmapBlur intensity={2} /> */}
        </EffectComposer>

        <Environment files={`/hdr/grass.hdr`}></Environment>
        <Stats></Stats>
        {/* <EnergySpa></EnergySpa> */}
      </Canvas>
      <div className='absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full'>
        {!noGUI && qrCode && start && (
          <>
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
            {progress}
            <img className='max-w-full w-96' src={qrCode}></img>
          </>
        )}
      </div>
    </>
  )
}

function CamSync() {
  // let mcamera = useMindAR((r) => r.camera)
  useFrame((st) => {
    // st.camera.position.copy(mcamera.position)
    // st.camera.quaternion.copy(mcamera.position)
    // st.camera.scale.copy(mcamera.scale)
    // st.camera.fov = mcamera.fov
    // st.camera.aspect = mcamera.aspect

    // if (mcamera) {
    //   // st.camera.copy(mcamera)
    // }
    st.camera.near = 0.1
    st.camera.far = 3000
    // st.camera.aspect = window.innerWidth / window.innerHeight
    st.camera.updateProjectionMatrix()
  })

  return null
}
