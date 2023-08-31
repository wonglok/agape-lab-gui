import { Vector2 } from "three";
export const initStoreForPostProc = ({ postProcessingConfig = {} }) => {
  postProcessingConfig.multisampling = postProcessingConfig.multisampling || 4;
  postProcessingConfig.emissiveIntensity =
    postProcessingConfig.emissiveIntensity || 0;
  postProcessingConfig.envMapIntensity =
    postProcessingConfig.envMapIntensity || 0;

  if (!postProcessingConfig.ssrPass) {
    postProcessingConfig.ssrPass = {
      useThisOne: true,

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
      velocityResolutionScale: 0.1,
    };
  }

  if (!postProcessingConfig.bloomPass) {
    postProcessingConfig.bloomPass = {
      useThisOne: true,

      mipmapBlur: true,
      luminanceThreshold: 0.5,
      intensity: 1,
      resolutionScale: 1,
    };
  }

  if (!postProcessingConfig.wavePass) {
    postProcessingConfig.wavePass = {
      useThisOne: true,

      //
      speed: 0.75,
      maxRadius: 0.3,
      waveSize: 0.2,
      amplitude: 0.3,
    };
  }

  if (!postProcessingConfig.chromePass) {
    postProcessingConfig.chromePass = {
      useThisOne: true,

      offsetX: 0.005,
      offsetY: 0.005,
      radialModulation: true,
      modulationOffset: 0.0,
      //
    };
  }
  if (!postProcessingConfig.colorPass) {
    postProcessingConfig.colorPass = {
      useThisOne: true,

      hue: 0.0,
      saturation: 0.0,

      brightness: 0.0,
      contrast: 0.0,
      //
    };

    if (!postProcessingConfig.aoPass) {
      postProcessingConfig.aoPass = {
        useThisOne: true,
      };

      postProcessingConfig.aoPass.aoRadius = 5.0;
      postProcessingConfig.aoPass.distanceFalloff = 1.0;
      postProcessingConfig.aoPass.intensity = 5.0;
      postProcessingConfig.aoPass.color = "#000000";
    }
  }

  return postProcessingConfig;
};
