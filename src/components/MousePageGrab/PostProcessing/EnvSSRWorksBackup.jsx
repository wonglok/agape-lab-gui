import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector2, Vector3, HalfFloatType } from "three";
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
// import { GroundProjectedEnv } from "../RealismEffect/realism/GroundProjectedEnv";

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

export function EnvSSRWorks({ useStore }) {
  let scene = useThree((r) => r.scene);
  let camera = useThree((r) => r.camera);
  let renderer = useThree((r) => r.gl);

  let [composer, setComposer] = useState(null);

  let works = useRef({});
  let postProcessingConfig = useStore((r) => r.postProcessingConfig);
  useEffect(() => {
    if (!renderer) {
      return;
    }
    if (!useStore) {
      return;
    }

    if (!postProcessingConfig) {
      return;
    }

    let cleans = [];
    let unPost = () => {};
    //
    Promise.resolve().then(async () => {
      let POSTPROCESSING = await import("postprocessing").then((r) => r);
      let { SSREffect } = await import("./ssr/index");

      let postProcessingConfig = useStore.getState().postProcessingConfig;
      works.current.masterLoop = () => {
        postProcessingConfig = useStore.getState().postProcessingConfig;
      };

      const composer = new POSTPROCESSING.EffectComposer(renderer, {
        multisampling: postProcessingConfig.multisampling || 0,
        stencilBuffer: false,
        frameBufferType: HalfFloatType,
      });

      let ssrOptions = {
        intensity: 1,
        exponent: 1,
        distance: 10,
        fade: 0,
        roughnessFade: 1,
        thickness: 10,
        ior: 1.45,
        maxRoughness: 1,
        maxDepthDifference: 10,
        blend: 0.9,
        correction: 1,
        correctionRadius: 1,
        blur: 0.0,
        blurKernel: 1,
        blurSharpness: 10,
        jitter: 0.025,
        jitterRoughness: 0.025,
        steps: 8,
        refineSteps: 8,
        missedRays: true,
        useNormalMap: true,
        useRoughnessMap: true,
        resolutionScale: 1,
        velocityResolutionScale: 1,
      };

      for (let kn in ssrOptions) {
        ssrOptions[kn] = postProcessingConfig.ssrPass[kn];
      }

      let ssrEf = new SSREffect(scene, camera, ssrOptions);
      works.current.ssrLoop = () => {
        postProcessingConfig = useStore.getState().postProcessingConfig;
        for (let kn in ssrOptions) {
          ssrEf[kn] = postProcessingConfig.ssrPass[kn];
          ssrOptions[kn] = postProcessingConfig.ssrPass[kn];
        }
      };

      const renderPass = new POSTPROCESSING.RenderPass(scene, camera);

      cleans.push(() => {
        renderPass.dispose();
      });

      let waveSettings = {
        speed: 0.75,
        maxRadius: 0.3,
        waveSize: 0.2,
        amplitude: 0.3,
      };

      for (let kn in waveSettings) {
        waveSettings[kn] = postProcessingConfig.wavePass[kn];
      }

      works.current.waveLoop = () => {
        for (let kn in waveSettings) {
          waves.forEach((waveProgram) => {
            waveProgram[kn] = postProcessingConfig.wavePass[kn];
          });
        }
      };
      let idx = 0;
      let waves = [
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
        new POSTPROCESSING.ShockWaveEffect(
          camera,
          new Vector3(0, 0, 0),
          waveSettings
        ),
      ];

      //
      window.addEventListener("shockwave", ({ detail: { positionArray } }) => {
        let swEffect = waves[idx % waves.length];
        swEffect.position.fromArray(positionArray);
        swEffect.explode();
        idx++;
      });

      let bloomSettings = {
        mipmapBlur: true,
        luminanceThreshold: 1.0,
        intensity: 1,
        resolutionScale: 1,
      };

      for (let kn in bloomSettings) {
        bloomSettings[kn] = postProcessingConfig.bloomPass[kn];
      }

      const bloomEffect = new POSTPROCESSING.BloomEffect({
        ...bloomSettings,
      });
      works.current.bloomLoop = () => {
        for (let kn in bloomSettings) {
          bloomEffect[kn] = postProcessingConfig.bloomPass[kn];
        }
      };

      postProcessingConfig.chromePass = postProcessingConfig.chromePass || {};
      postProcessingConfig.colorPass = postProcessingConfig.colorPass || {};

      //
      let cafEff = new POSTPROCESSING.ChromaticAberrationEffect({
        offset: postProcessingConfig.chromePass.offset || [0, 0],
        radialModulation:
          postProcessingConfig.chromePass.radialModulation || false,
        modulationOffset:
          postProcessingConfig.chromePass.modulationOffset || 0.0,
      });

      let huesat = new POSTPROCESSING.HueSaturationEffect({
        hue: 0.0,
        saturation: 0.0,
      });

      let bcEf = new POSTPROCESSING.BrightnessContrastEffect({
        brightness: 0.0,
        contrast: 0.0,
      });

      works.current.ssrLoop = () => {
        cafEff.enable = postProcessingConfig.chromePass.useThisOne || false;
        cafEff.offset = [
          postProcessingConfig.chromePass.offsetX || 0.0,
          postProcessingConfig.chromePass.offsetY || 0.0,
        ];
        cafEff.radialModulation =
          postProcessingConfig.chromePass.radialModulation || false;
        cafEff.modulationOffset =
          postProcessingConfig.chromePass.modulationOffset || 0.0;

        huesat.hue = postProcessingConfig.colorPass.hue || 0;
        huesat.saturation = postProcessingConfig.colorPass.saturation || 0;
        bcEf.brightness = postProcessingConfig.colorPass.brightness || 0;
        bcEf.contrast = postProcessingConfig.colorPass.contrast || 0;
      };

      let post2 = [];
      if (postProcessingConfig.colorPass?.useThisOne) {
        post2.push(huesat, bcEf);
      }

      if (postProcessingConfig.chromePass?.useThisOne) {
        post2.push(cafEff);
      }

      //

      let passes = [];
      if (postProcessingConfig.wavePass.useThisOne) {
        passes.push(...waves);
      }
      if (postProcessingConfig.bloomPass.useThisOne) {
        passes.push(bloomEffect);
        cleans.push(() => {
          bloomEffect.dispose();
        });
      }
      if (postProcessingConfig.ssrPass.useThisOne) {
        passes.push(ssrEf);
      }

      composer.removeAllPasses();
      composer.addPass(renderPass);
      cleans.push(() => {
        renderPass.dispose();
      });

      if (passes.length > 0) {
        const effectsList = new POSTPROCESSING.EffectPass(camera, ...passes);
        composer.addPass(effectsList);
        cleans.push(() => {
          effectsList.dispose();
        });
      }

      if (post2.length > 0) {
        let postProcPass2 = new POSTPROCESSING.EffectPass(camera, ...post2);
        composer.addPass(postProcPass2);

        cleans.push(() => {
          post2.forEach((r) => r.dispose());
          postProcPass2.dispose();
        });
      }

      setComposer((s) => {
        return composer;
      });

      cleans.push(() => {
        composer.dispose();
      });

      //
      //
      //
      //
      //
      //
    });

    return () => {
      unPost();
      cleans.forEach((r) => r());
    };
  }, [scene, camera, renderer, useStore]);

  useFrame((st, dt) => {
    if (composer && composer.render) {
      composer.render(dt);
    }

    let postProcessingConfig = useStore.getState().postProcessingConfig;

    if (scene && postProcessingConfig) {
      for (let kn in works.current) {
        works.current[kn](st, dt);
      }
      scene.traverse((it) => {
        if (it.material) {
          it.material.envMapIntensity = postProcessingConfig.envMapIntensity;
          it.material.emissiveIntensity =
            postProcessingConfig.emissiveIntensity;
        }
      });
    }
  }, 1000);

  //
  //

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

  return <group></group>;
}
