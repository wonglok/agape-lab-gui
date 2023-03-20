import { Environment, Sphere, TransformControls, useEnvironment, useTexture } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import {
  Color,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  FloatType,
  Vector2,
  sRGBEncoding,
} from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { useMeta } from '../MetaOnline/useMeta.js'

const options = {
  distance: 10,
  thickness: 10,
  autoThickness: false,
  maxRoughness: 1,
  blend: 0.9,
  denoiseIterations: 1,
  denoiseKernel: 2,
  denoiseDiffuse: 10,
  denoiseSpecular: 10,
  depthPhi: 2,
  normalPhi: 50,
  roughnessPhi: 1,
  envBlur: 0.5,
  importanceSampling: true,
  directLightMultiplier: 1,
  maxEnvLuminance: 50,
  steps: 20,
  refineSteps: 5,
  spp: 1,
  resolutionScale: 1,
  missedRays: false,
}

export function EnvGenerator({ customLighting = false }) {
  let scene = useThree((r) => r.scene)
  let camera = useThree((r) => r.camera)
  let renderer = useThree((r) => r.gl)

  let [composer, setComposer] = useState(false)

  useEffect(() => {
    if (composer) {
      return
    }
    let cleans = []
    //
    Promise.resolve().then(async () => {
      let POSTPROCESSING = await import('postprocessing').then((r) => r)
      let { SSGIEffect, SSDGIEffect, SSREffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } = await import(
        './realism/index'
      )

      const composer = new POSTPROCESSING.EffectComposer(renderer, { multisampling: 0 })
      const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)

      const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, {
        ...options,
      })

      // SMAA
      // const smaaEffect = new POSTPROCESSING.SMAAEffect()

      // Motion Blur
      const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass)

      // const bloomEffect = new BloomEffect({
      //   //
      //   intensity: 1,
      //   mipmapBlur: true,
      //   luminanceSmoothing: 0.8,
      //   luminanceThreshold: 0.8,
      // })
      // const vignetteEffect = new POSTPROCESSING.VignetteEffect({
      //   darkness: 0.8,
      //   offset: 0.3,
      // })

      // let lutTexture = await new POSTPROCESSING.LUT3dlLoader().load('/ssgi/lut.3dl')
      // const lutEffect = new POSTPROCESSING.LUT3DEffect(lutTexture)

      // const smaaPass = new POSTPROCESSING.EffectPass(camera, smaaEffect)
      const ssgiPass = new POSTPROCESSING.EffectPass(camera, ssgiEffect)
      const motionPass = new POSTPROCESSING.EffectPass(camera, motionBlurEffect) // bloomEffect, vignetteEffect, lutEffect

      const renderPass = new POSTPROCESSING.RenderPass(scene, camera)

      composer.addPass(renderPass)
      composer.addPass(velocityDepthNormalPass)
      // composer.addPass(smaaPass)
      composer.addPass(ssgiPass)
      composer.addPass(motionPass)

      setComposer(composer)

      // if (process.env.NODE_ENV === 'development' && window.innerWidth >= 1500) {
      //   let ssgidebug = new SSGIDebugGUI(ssgiEffect, options)

      //   cleans.push(() => {
      //     ssgidebug.clean()
      //   })
      // }
    })

    return () => {
      cleans.forEach((r) => r())
    }
  }, [scene, camera, renderer])

  //

  useFrame((st, dt) => {
    if (composer && composer.render) {
      composer.render(dt)
    }
  }, 1000)
  useEffect(() => {
    if (composer && renderer) {
      let size = new Vector2()
      renderer.getSize(size)
      composer.setSize(size.width, size.height)
    }
  }, [composer, renderer])

  return (
    <group>
      {<DefaultLighting></DefaultLighting>}
      {customLighting}
    </group>
  )
}

function DefaultLighting() {
  let gl = useThree((r) => r.gl)
  gl.useLegacyLights = true

  let scene = useThree((r) => r.scene)
  let tex = useTexture(`/envMap/ma-galaxy.jpg`)

  tex.encoding = sRGBEncoding
  tex.mapping = EquirectangularReflectionMapping
  scene.background = tex
  scene.environment = null

  let debugLight = true

  return (
    <group>
      {/* <spotLight map={tex} color={'#ffffff'} target-position={[0, 0, 0]} intensity={30} position={[5, 10, 0]}>
        <Sphere visible={debugLight} scale={0.2}></Sphere>
      </spotLight> */}

      {/* <pointLight color={'#ff00ff'} intensity={50} position={[4, 4, -6]}>
        <Sphere visible={debugLight} scale={0.2}></Sphere>
      </pointLight>

      <pointLight color={'#00ffff'} intensity={50} position={[-4, 4, -6]}>
        <Sphere visible={debugLight} scale={0.2}></Sphere>
      </pointLight> */}

      <directionalLight intensity={10} position={[0, 1, 1]}></directionalLight>
      <directionalLight intensity={10} position={[0, 1, -1]}></directionalLight>
      <ambientLight intensity={10} color={'#ffffff'}></ambientLight>

      {/* <pointLight color={'#ffffff'} position={[0, 9, -15.5]} intensity={25}>
        <Sphere visible={debugLight} scale={0.2}></Sphere>
      </pointLight> */}
    </group>
  )
}

//

// import { Box, Sphere, useFBO, useTexture } from '@react-three/drei'
// import { createPortal, useFrame, useThree } from '@react-three/fiber'
// import { useEffect, useMemo } from 'react'
// import {
//   BackSide,
//   BoxGeometry,
//   Camera,
//   Clock,
//   Color,
//   CubeCamera,
//   DoubleSide,
//   EquirectangularReflectionMapping,
//   LinearEncoding,
//   LinearFilter,
//   LinearMipmapLinearFilter,
//   Mesh,
//   NoBlending,
//   PlaneGeometry,
//   Scene,
//   ShaderMaterial,
//   WebGLCubeRenderTarget,
//   WebGLRenderTarget,
//   cloneUniforms,
//   sRGBEncoding,
// } from 'three'

// const options = {
//   distance: 10,
//   thickness: 10,
//   autoThickness: false,
//   maxRoughness: 1,
//   blend: 0.9,
//   denoiseIterations: 1,
//   denoiseKernel: 2,
//   denoiseDiffuse: 10,
//   denoiseSpecular: 10,
//   depthPhi: 2,
//   normalPhi: 50,
//   roughnessPhi: 1,
//   envBlur: 0.5,
//   importanceSampling: true,
//   directLightMultiplier: 1,
//   maxEnvLuminance: 50,
//   steps: 20,
//   refineSteps: 5,
//   spp: 1,
//   resolutionScale: 1,
//   missedRays: false,
// }

// export function EnvGenerator({ url = `/envMap/ma-galaxy.webp` }) {
//   let camera = useThree((r) => r.camera)
//   let gl = useThree((r) => r.gl)
//   let scene = useThree((r) => r.scene)
//   let fbo = useFBO(1024, 1024, {})
//   fbo.texture.mapping = EquirectangularReflectionMapping
//   fbo.texture.encoding = LinearEncoding

//   // let texture = useTexture(`${url}`)

//   useFrame(({ gl }) => {
//     gl.setRenderTarget(fbo)
//     gl.render(scene, camera)
//     gl.setRenderTarget(null)

//     fbo.texture.needsUpdate = true

//     // scene.background = fbo.texture
//     // scene.environment = fbo.texture
//     //
//     // console.log(123)
//     //
//   }, 1000)

//   useEffect(() => {
//     let clean = () => {}
//     // import * as  from 'postprocessing'
//     Promise.resolve().then(async () => {
//       // const pmremGenerator = new PMREMGenerator(gl)
//       // pmremGenerator.compileEquirectangularShader()

//       let BloomEffect = await import('postprocessing').then((r) => r.BloomEffect)
//       let LUT3dlLoader = await import('postprocessing').then((r) => r.LUT3dlLoader)
//       let EffectComposer = await import('postprocessing').then((r) => r.EffectComposer)
//       let EffectPass = await import('postprocessing').then((r) => r.EffectPass)
//       let LUT3DEffect = await import('postprocessing').then((r) => r.LUT3DEffect)
//       let { SSGIEffect, VelocityDepthNormalPass, SSREffect, SSDGIEffect, MotionBlurEffect } = await import(
//         './realism/index'
//       )

//       const composer = new EffectComposer(gl, { multisampling: 0 })

//       const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
//       composer.addPass(velocityDepthNormalPass)

//       const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, { ...options })

//       let lut = await new LUT3dlLoader().loadAsync('/ssgi/lut.3dl')

//       const lutEffect = new LUT3DEffect(lut)

//       // const newBloomEffect = new BloomEffect({ luminanceThreshold: 0.0, intensity: 3, mipmapBlur: true })

//       const effectPass = new EffectPass(gl, ssgiEffect, lutEffect)
//       effectPass.enabled = true
//       composer.addPass(effectPass)

//       // let rgbe = await new RGBELoader().loadAsync(`/envMap/evening_road_01_puresky_1k.hdr`)
//       // rgbe.mapping = EquirectangularReflectionMapping
//       // rgbe.encoding = LinearEncoding

//       let rAFID = 0
//       let clock = new Clock()
//       let rAF = () => {
//         rAFID = requestAnimationFrame(rAF)
//         let dt = clock.getDelta()

//         composer.render(dt)
//       }
//       rAFID = requestAnimationFrame(rAF)

//       window.addEventListener('resize', () => {
//         composer.setSize(window.innerWidth, window.innerHeight)
//       })

//       let cleans2 = () => {}

//       // if (process.env.NODE_ENV === 'development' && window.innerWidth >= 1500) {
//       //   let ssgidebug = new SSGIDebugGUI(ssgiEffect, options)
//       //   cleans2 = () => {
//       //     ssgidebug.clean()
//       //   }
//       // }

//       clean = () => {
//         cancelAnimationFrame(rAFID)
//         composer.dispose()
//         cleans2()
//       }
//     })

//     return () => {
//       clean()
//     }
//   }, [camera, gl, scene])

//   return (
//     <group>
//       {/*  */}
//       {/*  */}
//       {/*  */}
//       {/*  */}
//     </group>
//   )
// }
