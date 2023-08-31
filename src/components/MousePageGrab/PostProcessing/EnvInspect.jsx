// import { useStore } from '@/backend/useStore'
// import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
  Clock,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Vector2,
  MeshStandardMaterial,
  DoubleSide,
} from "three";
import { N8AOPostPass } from "n8ao/dist/N8AO";

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

export function EnvInspect({ useStore }) {
  let scene = useThree((r) => r.scene);
  let camera = useThree((r) => r.camera);
  let renderer = useThree((r) => r.gl);
  let insepction = useStore((r) => r.insepction);

  let [composer, setComposer] = useState(null);

  // useFrame(({ controls }) => {
  //   let dist = controls.getDistance()
  //   console.log(dist)
  // })

  useEffect(() => {
    //
    let cleans = [];
    //
    Promise.resolve().then(async () => {
      const POSTPROCESSING = await import("postprocessing").then((r) => r);
      const composer = new POSTPROCESSING.EffectComposer(renderer, {
        multisampling: 4,
        alpha: true,
        stencilBuffer: false,
        normalBuffer: false,
      });

      cleans.push(() => {
        composer.dispose();
      });

      // add t
      let rAFID = 0;
      let clock = new Clock();
      let rAF = () => {
        rAFID = requestAnimationFrame(rAF);
        let t = clock.getElapsedTime();
        // material.uniforms.time.value = t
      };
      rAFID = requestAnimationFrame(rAF);

      const renderPass = new POSTPROCESSING.RenderPass(scene, camera);

      cleans.push(() => {
        renderPass.dispose();
      });

      composer.addPass(renderPass);

      if (insepction === "combined") {
        let effAO = new POSTPROCESSING.SSAOEffect(camera, undefined, {});
        const effPass = new POSTPROCESSING.EffectPass(camera, effAO);
        composer.addPass(effPass);
      }

      if (insepction === "ao") {
        let n8Pass = new N8AOPostPass(scene, camera);
        composer.addPass(n8Pass);
      }
      setComposer((s) => {
        return composer;
      });
    });

    return () => {
      cleans.forEach((r) => r());
    };
  }, [scene, camera, renderer, insepction]);

  let origMaterial = new Map();

  let caches = new Map();
  useFrame((st, dt) => {
    if (composer && composer.render) {
      st.scene.traverse((it) => {
        if (it.material) {
          if (!origMaterial.has(it.uuid)) {
            origMaterial.set(it.uuid, it.material.clone());
          }
        }
      });

      st.scene.traverse((it) => {
        if (it.material) {
          if (origMaterial.has(it.uuid)) {
            let oo = origMaterial.get(it.uuid);

            if (!caches.has(insepction)) {
              caches.set(insepction, new Map());
            }
            let thisCache = caches.get(insepction);

            if (!thisCache.has(it.uuid)) {
              if (insepction === "combined") {
                thisCache.set(it.uuid, oo.clone());
              } else if (insepction === "normal") {
                thisCache.set(
                  it.uuid,
                  new MeshNormalMaterial({ side: DoubleSide })
                );
              } else if (insepction === "color") {
                thisCache.set(
                  it.uuid,
                  new MeshBasicMaterial({ color: oo.color, map: oo.map })
                );
              } else if (insepction === "roughnessMetalness") {
                thisCache.set(
                  it.uuid,
                  new MeshBasicMaterial({ map: oo.roughnessMap })
                );
              } else if (insepction === "ao") {
                thisCache.set(it.uuid, new MeshBasicMaterial({}));
              }
            }

            //
            it.material = thisCache.get(it.uuid);
          }
        }
      });

      composer.render(dt);

      st.scene.traverse((it) => {
        if (it.material) {
          if (origMaterial.has(it.uuid)) {
            it.material = origMaterial.get(it.uuid);
          }
        }
      });
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

  return <group></group>;
}
