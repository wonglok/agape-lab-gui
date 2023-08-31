import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import {
  Color,
  // ACESFilmicToneMapping,
  // CineonToneMapping,
  // Color,
  // DirectionalLight,
  // DoubleSide,
  EquirectangularReflectionMapping,
  MeshBasicMaterial,
  // FloatType,
  // FloatType,
  // HalfFloatType,
  Vector2,
  Vector3,
  sRGBEncoding,
} from "three";
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
// import { GroundProjectedEnv } from '../RealismEffect/realism/GroundProjectedEnv'

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
//   steps: 20 - 10,
//   refineSteps: 5,
//   spp: 1,
//   resolutionScale: 1,
//   missedRays: false,
// }

export function EnvWireframe({ customLighting = null }) {
  let scene = useThree((r) => r.scene);
  let camera = useThree((r) => r.camera);
  let renderer = useThree((r) => r.gl);

  let [composer, setComposer] = useState(null);

  // useFrame(({ controls }) => {
  //   let dist = controls.getDistance()

  //   console.log(dist)
  // })
  useEffect(() => {
    let cleans = [];
    //
    Promise.resolve().then(async () => {
      let POSTPROCESSING = await import("postprocessing").then((r) => r);
      const composer = new POSTPROCESSING.EffectComposer(renderer, {
        multisampling: 0,
        alpha: true,
        stencilBuffer: false,
      });

      cleans.push(() => {
        composer.dispose();
      });
      // let ssrOptions = {
      //   intensity: 1,
      //   exponent: 1,
      //   distance: 10,
      //   fade: 0,
      //   roughnessFade: 1,
      //   thickness: 10,
      //   ior: 1.45,
      //   maxRoughness: 1,
      //   maxDepthDifference: 10,
      //   blend: 0.9,
      //   correction: 1,
      //   correctionRadius: 1,
      //   blur: 0.5,
      //   blurKernel: 1,
      //   blurSharpness: 10,
      //   jitter: 0.05,
      //   jitterRoughness: 0.05,
      //   steps: 20,
      //   refineSteps: 5,
      //   missedRays: true,
      //   useNormalMap: true,
      //   useRoughnessMap: true,
      //   resolutionScale: 1.0,
      //   velocityResolutionScale: 1.0,
      // }
      // let { SSREffect } = await import('./ssr/index')

      // let ssrEf = new SSREffect(scene, camera, ssrOptions)

      // const bloomEffect = new POSTPROCESSING.BloomEffect({
      //   mipmapBlur: true,
      //   luminanceThreshold: 0.3,
      //   intensity: 1,
      //   resolutionScale: 0.5,
      // })

      const renderPass = new POSTPROCESSING.RenderPass(
        scene,
        camera,
        new MeshBasicMaterial({ color: new Color("#ffffff"), wireframe: true })
      );
      // scene.background = new Color("#000000");

      cleans.push(() => {
        renderPass.dispose();
      });

      // let swEffect1 = new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), {
      //   speed: 0.75,
      //   maxRadius: 0.3,
      //   waveSize: 0.2,
      //   amplitude: 0.3,
      // })
      // let swEffect2 = new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), {
      //   speed: 0.75,
      //   maxRadius: 0.3,
      //   waveSize: 0.2,
      //   amplitude: 0.3,
      // })
      // let swEffect3 = new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), {
      //   speed: 0.75,
      //   maxRadius: 0.3,
      //   waveSize: 0.2,
      //   amplitude: 0.3,
      // })

      // let idx = 0
      // let waves = [swEffect1, swEffect2, swEffect3]
      // window.addEventListener('shockwave', ({ detail: { positionArray } }) => {
      //   let swEffect = waves[idx % waves.length]
      //   swEffect.position.fromArray(positionArray)
      //   swEffect.explode()
      //   idx++
      // })

      // const effectPass = new POSTPROCESSING.EffectPass(camera, swEffect1, swEffect2, swEffect3)

      composer.addPass(renderPass);
      // composer.addPass(effectPass)

      // let { SSGIEffect, SSDGIEffect, TRAAEffect, VelocityPass, MotionBlurEffect, VelocityDepthNormalPass } =
      //   await import('./realism/index.js')
      // const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
      // const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass, {
      //   intensity: 2,
      // })

      // // composer.addPass(motionPass)

      // const ssgiEffect = new SSDGIEffect(scene, camera, velocityDepthNormalPass)

      // // const ssEffect = new SSREffect(scene, camera, velocityDepthNormalPass, { ...options })

      // // // SMAA
      // // // const antiEffect = new TRAAEffect(scene, camera, velocityDepthNormalPass, {})

      // // // Motion Blur

      // const bloomEffect = new POST.BloomEffect({
      //   //
      //   intensity: 1.5,
      //   mipmapBlur: true,
      //   luminanceThreshold: 0.85,
      // })

      // const vignetteEffect = new POST.VignetteEffect({
      //   darkness: 0.8,
      //   offset: 0.3,
      // })

      // // const ssgiPass = new POST.EffectPass(camera, ssgiEffect)
      // // const ssPass = new POST.EffectPass(camera, ssEffect)

      // // composer.addPass(renderPass)
      // // composer.addPass(velocityDepthNormalPass)
      // // // composer.addPass(ssPass)

      // const motionPass = new POST.EffectPass(
      //   camera,
      //   // antiEffect,
      //   // vignetteEffect,
      //   motionBlurEffect,
      //   bloomEffect,
      //   vignetteEffect,

      //   // bloomEffect,
      // ) // bloomEffect, vignetteEffect, lutEffect
      // //

      // // composer.addPass(velocityDepthNormalPass)
      // // composer.addPass(motionPass)

      // renderer.toneMapping = ACESFilmicToneMapping

      // if (process.env.NODE_ENV === 'development' && window.innerWidth >= 1024) {
      //   let { SSGIDebugGUI } = await import('./realism/SSGIDebugGUI')

      //   if (typeof ssEffect !== 'undefined') {
      //     let ssgidebug = new SSGIDebugGUI(ssEffect, options)

      //     cleans.push(() => {
      //       ssgidebug.clean()
      //     })
      //   }
      // }

      setComposer((s) => {
        return composer;
      });
    });

    return () => {
      cleans.forEach((r) => r());
    };
  }, [scene, camera, renderer]);

  useFrame((st, dt) => {
    if (composer && composer.render) {
      composer.render(dt);
    }
  }, 1000);

  let size = useThree((r) => r.size);
  useEffect(() => {
    if (composer && renderer) {
      let size2 = new Vector2();
      let ratio = window.devicePixelRatio * 0.75;
      if (ratio <= 1) {
        ratio = 1;
      }
      renderer.setPixelRatio(ratio);
      renderer.getSize(size2);
      composer.setSize(size2.x, size2.y);
    }
  }, [composer, size, renderer]);

  return (
    <group>
      {/* <DefaultLighting></DefaultLighting> */}
      {/* <DefaultLightingTexture></DefaultLightingTexture> */}
      {/* <Suspense fallback={null}><DefaultLighting></DefaultLighting></Suspense> */}
      {/* {customLighting} */}
    </group>
  );
}

// function DefaultLighting() {
//   let scene = useThree((r) => r.scene)
//   let tex = useTexture(`/envMap/ma-galaxy.jpg`)
//   tex.generateMipmaps = true
//   tex.encoding = sRGBEncoding
//   tex.mapping = EquirectangularReflectionMapping
//   scene.environment = tex
//   scene.background = tex

//   // let rgbe = new RGBELoader()
//   // rgbe.setDataType(FloatType)
//   // rgbe.loadAsync(`/envMap/evening_meadow_1k.hdr`).then((tex) => {
//   //   tex.generateMipmaps = true
//   //   tex.mapping = EquirectangularReflectionMapping
//   //   scene.background = tex
//   //   scene.environment = tex
//   // })

//   return (
//     <group>
//       {/* <Stats></Stats> */}
//       {/* <Sphere args={[100, 32, 32]}>
//         <meshStandardMaterial map={tex} metalness={0} roughness={1} side={DoubleSide}></meshStandardMaterial>
//       </Sphere> */}
//       <directionalLight color={'#ffffff'} position={[0, 10, -10]} intensity={0.25}></directionalLight>
//       <directionalLight color={'#ffffff'} position={[0, 10, 10]} intensity={0.25}></directionalLight>
//       <directionalLight color={'#ffffff'} position={[10, 10, 10]} intensity={0.25}></directionalLight>
//       <directionalLight color={'#ffffff'} position={[-10, 10, 10]} intensity={0.25}></directionalLight>
//     </group>
//   )
// }

// //

// function DefaultLightingTexture() {
//   let tex = useTexture(`/envMap/snowy_field.webp`)
//   // let tex = useTexture(`/envMap/ma-galaxy.webp`)
//   let scene = useThree((r) => r.scene)
//   tex.encoding = sRGBEncoding
//   tex.mapping = EquirectangularReflectionMapping
//   // scene.background = tex
//   // scene.environment = null

//   // let debugLight = true

//   useEffect(() => {
//     let item = new GroundProjectedEnv(tex, {
//       height: 55,
//       radius: 120,
//     })
//     item.rotation.y = Math.PI * 1
//     item.scale.setScalar(100)
//     scene.add(item)
//     return () => {
//       item.removeFromParent()
//     }
//   }, [tex])

//   return (
//     <group>
//       {/* <spotLight map={tex} color={'#ffffff'} target-position={[0, 0, 0]} intensity={30} position={[5, 10, 0]}>
//         <Sphere visible={debugLight} scale={0.2}></Sphere>
//       </spotLight> */}

//       {/* <pointLight color={'#ff00ff'} intensity={50} position={[4, 4, -6]}>
//         <Sphere visible={debugLight} scale={0.2}></Sphere>
//       </pointLight>

//       <pointLight color={'#00ffff'} intensity={50} position={[-4, 4, -6]}>
//         <Sphere visible={debugLight} scale={0.2}></Sphere>
//       </pointLight> */}

//       {/* <pointLight color={'#ffffff'} position={[0, 9, -15.5]} intensity={25}>
//         <Sphere visible={debugLight} scale={0.2}></Sphere>
//       </pointLight> */}
//     </group>
//   )
// }
