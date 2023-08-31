import { Box, Environment, useFBO } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector2, Vector3, HalfFloatType, TextureLoader, sRGBEncoding, RepeatWrapping, Scene, Color } from 'three'
import { create } from 'zustand'
import { N8AOPostPass } from 'n8ao/dist/N8AO'

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
  velocityResolutionScale: 0.1,
}

let waveSettings = {
  speed: 0.75,
  maxRadius: 0.3,
  waveSize: 0.2,
  amplitude: 0.3,
}

let bloomSettings = {
  mipmapBlur: true,
  luminanceThreshold: 1.0,
  intensity: 1,
  resolutionScale: 1,
}

let usePostProcessors = create((set, get) => {
  return {
    //
    SSREffect: false,
    POSTPROCESSING: false,
    composer: false,

    useStore: false,
  }
})

export function EnvSSRWorks({ isGame = false, useStore }) {
  let scene = useThree((r) => r.scene)
  let camera = useThree((r) => r.camera)
  let renderer = useThree((r) => r.gl)
  let gl = useThree((r) => r.gl)

  let composer = usePostProcessors((r) => r.composer)
  let SSREffect = usePostProcessors((r) => r.SSREffect)
  /** @type {import('postprocessing')} */
  let POSTPROCESSING = usePostProcessors((r) => r.POSTPROCESSING)
  let postProcessingConfig = useStore((r) => r.postProcessingConfig)

  let reload = useStore((r) => r.reload)

  useEffect(() => {
    Promise.resolve().then(async () => {
      let POSTPROCESSING = await import('postprocessing').then((r) => r)
      let { SSREffect } = await import('./ssr/index')
      usePostProcessors.setState({
        SSREffect,
        POSTPROCESSING,
      })
    })
  }, [])

  useEffect(() => {
    if (!useStore) {
      return
    }
    if (!POSTPROCESSING) {
      return
    }
    if (!renderer) {
      return
    }

    const composer = new POSTPROCESSING.EffectComposer(renderer, {
      multisampling: postProcessingConfig.multisampling || 0,
      stencilBuffer: false,
      frameBufferType: HalfFloatType,
    })

    usePostProcessors.setState({ composer })
  }, [useStore, renderer, POSTPROCESSING, postProcessingConfig.multisampling])

  useEffect(() => {
    if (!composer) {
      return
    }
  }, [composer])

  useFrame(() => {
    if (scene && postProcessingConfig) {
      scene.traverse((it) => {
        if (it.material) {
          it.material.envMapIntensity = postProcessingConfig.envMapIntensity
          it.material.emissiveIntensity = postProcessingConfig.emissiveIntensity
        }
      })
    }
  })

  useEffect(() => {
    if (!SSREffect) {
      return
    }

    let ssrEffect = new SSREffect(scene, camera, ssrOptions)

    console.log('init', 'ssrEffect', ssrEffect)
    usePostProcessors.setState({ ssrEffect })

    return () => {
      //
    }
  }, [usePostProcessors, SSREffect, scene, camera])

  let ssrEffect = usePostProcessors((r) => r.ssrEffect)

  useEffect(() => {
    //
    if (!ssrEffect) {
      return
    }

    for (let kn in ssrOptions) {
      ssrEffect[kn] = postProcessingConfig.ssrPass[kn]
    }
  }, [ssrEffect, postProcessingConfig, reload])

  useEffect(() => {
    //
    //
    if (!POSTPROCESSING) {
      return
    }
    if (!camera) {
      return
    }

    let idx = 0
    let waves = [
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
      new POSTPROCESSING.ShockWaveEffect(camera, new Vector3(0, 0, 0), waveSettings),
    ]

    //
    window.addEventListener('shockwave', ({ detail: { positionArray } }) => {
      let swEffect = waves[idx % waves.length]
      swEffect.position.fromArray(positionArray)
      swEffect.explode()
      idx++
      console.log('shockwave')
    })

    console.log('init', 'waves')
    usePostProcessors.setState({ waves })
    //
  }, [POSTPROCESSING, camera, scene, usePostProcessors, waveSettings])

  let waves = usePostProcessors((r) => r.waves)
  useEffect(() => {
    if (!waves) {
      return
    }

    let waveSettings = {
      speed: 0.75,
      maxRadius: 0.3,
      waveSize: 0.2,
      amplitude: 0.3,
    }

    for (let kn in waveSettings) {
      waves.forEach((waveProgram) => {
        waveProgram[kn] = postProcessingConfig.wavePass[kn]
      })
    }
  }, [waves, camera, scene, postProcessingConfig, reload])

  useEffect(() => {
    if (!POSTPROCESSING) {
      return
    }
    if (!camera) {
      return
    }

    let bloomConfig = {
      ...bloomSettings,
    }
    for (let kn in bloomSettings) {
      bloomConfig[kn] = postProcessingConfig.bloomPass[kn]
    }

    const bloomEffect = new POSTPROCESSING.BloomEffect({
      ...bloomConfig,
    })

    console.log('init', 'bloomEffect', bloomEffect)

    usePostProcessors.setState({ bloomEffect })
  }, [
    POSTPROCESSING,
    camera,
    scene,
    usePostProcessors,
    postProcessingConfig?.bloomPass,
    postProcessingConfig?.bloomPass?.luminanceThreshold,
    postProcessingConfig?.bloomPass?.luminanceSmoothing,
    postProcessingConfig?.bloomPass?.mipmapBlur,
    postProcessingConfig?.bloomPass?.useThisOne,
    bloomSettings,
  ])

  let bloomEffect = usePostProcessors((r) => r.bloomEffect)
  useEffect(() => {
    if (!bloomEffect) {
      return
    }
    if (!postProcessingConfig) {
      return
    }
    for (let kn in bloomSettings) {
      bloomEffect[kn] = postProcessingConfig.bloomPass[kn]
    }
  }, [bloomEffect, postProcessingConfig.bloomPass, reload])

  useEffect(() => {
    if (!POSTPROCESSING) {
      return
    }
    let chromeEff = new POSTPROCESSING.ChromaticAberrationEffect({
      offset: new Vector2(0, 0),
      radialModulation: false,
      modulationOffset: 0.0,
    })

    usePostProcessors.setState({ chromeEff })
  }, [usePostProcessors, POSTPROCESSING])

  let chromeEff = usePostProcessors((r) => r.chromeEff)
  useEffect(() => {
    if (!chromeEff) {
      return
    }
    chromeEff.offset = new Vector2().fromArray([
      postProcessingConfig.chromePass.offsetX,
      postProcessingConfig.chromePass.offsetY,
    ])

    chromeEff.radialModulation = postProcessingConfig.chromePass.radialModulation

    chromeEff.modulationOffset = postProcessingConfig.chromePass.modulationOffset

    //
  }, [chromeEff, postProcessingConfig.chromePass, reload])

  useEffect(() => {
    if (!POSTPROCESSING) {
      return
    }
    let hueSatEff = new POSTPROCESSING.HueSaturationEffect({
      hue: 0.0,
      saturation: 0.0,
    })

    let brightEff = new POSTPROCESSING.BrightnessContrastEffect({
      brightness: 0.0,
      contrast: 0.0,
    })

    usePostProcessors.setState({ brightEff, hueSatEff })
  }, [POSTPROCESSING, usePostProcessors])

  let brightEff = usePostProcessors((r) => r.brightEff)
  let hueSatEff = usePostProcessors((r) => r.hueSatEff)
  useEffect(() => {
    if (!hueSatEff) {
      return
    }
    if (!brightEff) {
      return
    }

    hueSatEff.hue = postProcessingConfig.colorPass.hue
    hueSatEff.saturation = postProcessingConfig.colorPass.saturation

    brightEff.brightness = postProcessingConfig.colorPass.brightness
    brightEff.contrast = postProcessingConfig.colorPass.contrast

    //
  }, [brightEff, hueSatEff, postProcessingConfig.colorPass, reload])

  let editTunnel = useStore((r) => r.editTunnel) || null
  let hasTunnel = !!editTunnel

  useEffect(() => {
    if (!POSTPROCESSING) {
      return
    }

    if (!hasTunnel) {
      return
    }

    if (isGame) {
      return
    }
    let textureEff = new POSTPROCESSING.TextureEffect({
      blendFunction: POSTPROCESSING.BlendFunction.ALPHA,
      texture: new TextureLoader().load(`/agape-sdk/img/raw_plank_wall.webp`, (texture) => {
        texture.encoding = sRGBEncoding
        texture.repeat.set(1, 1)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }),
    })

    useStore.setState({ textureEff })
  }, [useStore, hasTunnel, isGame])

  let textureEff = useStore((r) => r.textureEff)

  useEffect(() => {
    if (!composer) {
      return
    }
    if (!POSTPROCESSING) {
      return
    }
    if (!camera) {
      return
    }
    if (!postProcessingConfig?.aoPass) {
      return
    }

    let n8aoPass = new N8AOPostPass(scene, camera)
    // let n8aoPass = new POSTPROCESSING.SSAOEffect(camera, null, {
    //   intensity: postProcessingConfig?.aoPass?.intensity,
    // });

    useStore.setState({ n8aoPass: n8aoPass })
  }, [
    composer,
    camera,
    POSTPROCESSING,
    postProcessingConfig?.aoPass?.useThisOne,
    postProcessingConfig?.aoPass?.intensity,
  ])

  let n8aoPass = useStore((r) => r.n8aoPass)

  useEffect(() => {
    //
    if (!n8aoPass) {
      return
    }
    if (!postProcessingConfig?.aoPass) {
      return
    }
    //

    n8aoPass.configuration.aoRadius = postProcessingConfig?.aoPass.aoRadius
    n8aoPass.configuration.distanceFalloff = postProcessingConfig?.aoPass.distanceFalloff
    n8aoPass.configuration.intensity = postProcessingConfig?.aoPass.intensity
    n8aoPass.configuration.color = new Color(postProcessingConfig?.aoPass.color || '#000000')

    n8aoPass.needsUpdate = true
  }, [
    n8aoPass,
    postProcessingConfig?.aoPass,
    postProcessingConfig?.aoPass.aoRadius,
    postProcessingConfig?.aoPass.distanceFalloff,
    postProcessingConfig?.aoPass.intensity,
    postProcessingConfig?.aoPass.color,
  ])

  useEffect(() => {
    if (!POSTPROCESSING) {
      return
    }
    if (!camera) {
      return
    }

    if (!composer) {
      return
    }
    if (!scene) {
      return
    }
    if (!camera) {
      return
    }
    if (!gl) {
      return
    }

    try {
      composer.removeAllPasses()

      try {
        let renderPass = new POSTPROCESSING.RenderPass(scene, camera)
        composer.addPass(renderPass)
      } catch (e) {
        console.log(e)
      }

      let effs = []

      if (waves && waves.length > 0 && postProcessingConfig?.wavePass?.useThisOne) {
        effs.push(...waves)
      }

      if (ssrEffect && postProcessingConfig?.ssrPass?.useThisOne) {
        effs.push(ssrEffect)
      }

      if (bloomEffect && postProcessingConfig?.bloomPass?.useThisOne) {
        effs.push(bloomEffect)
      }

      let effectPass1 = false
      if (effs.length > 0) {
        effectPass1 = new POSTPROCESSING.EffectPass(camera, ...effs)
        composer.addPass(effectPass1)
      }

      let effs2 = []

      if (chromeEff && postProcessingConfig?.chromePass?.useThisOne) {
        effs2.push(chromeEff)
      }

      if (hueSatEff && postProcessingConfig?.colorPass?.useThisOne) {
        effs2.push(hueSatEff)
      }

      if (brightEff && postProcessingConfig?.colorPass?.useThisOne) {
        effs2.push(brightEff)
      }

      if (textureEff) {
        effs2.push(textureEff)
      }

      let effectPass2 = false
      if (effs2.length > 0) {
        effectPass2 = new POSTPROCESSING.EffectPass(camera, ...effs2)
        composer.addPass(effectPass2)
      }

      if (n8aoPass && postProcessingConfig?.aoPass?.useThisOne) {
        composer.addPass(n8aoPass)
      }

      console.log('composer', 'all pass reset')

      return () => {
        composer.removeAllPasses()
        // effectPass1?.dispose();
        // effectPass2?.dispose();
      }

      // composer.addPass(new POSTPROCESSING.EffectPass(camera, ));
    } catch (e) {
      //
      console.error(e)
    }
    //
  }, [
    composer,
    POSTPROCESSING,
    scene,
    camera,
    waves,
    ssrEffect,
    bloomEffect,
    hueSatEff,
    brightEff,
    chromeEff,
    textureEff,
    n8aoPass,
    postProcessingConfig?.wavePass?.useThisOne,
    postProcessingConfig?.bloomPass?.useThisOne,
    postProcessingConfig?.ssrPass?.useThisOne,
    postProcessingConfig?.colorPass?.useThisOne,
    postProcessingConfig?.chromePass?.useThisOne,
  ])

  useFrame((st, dt) => {
    if (composer && composer.render) {
      try {
        composer.render(dt)
      } catch (e) {
        console.log(e)
      }
    }
  }, 1000)

  let size = useThree((r) => r.size)
  useEffect(() => {
    if (composer) {
      composer.setSize(size.width, size.height, true)
    }
  }, [composer, size])

  return (
    <>
      {/*  */}
      {/*  */}
      {textureEff && !isGame && editTunnel && <RenderFBO useStore={useStore} textureEff={textureEff}></RenderFBO>}
      {/*  */}
    </>
  )
}

export function RenderFBO({ textureEff, useStore }) {
  let sceneFBO = useMemo(() => {
    return new Scene()
  }, [])

  let camera = useThree((r) => r.camera)
  let size = useThree((r) => r.size)
  let fbo = useFBO(size.width, size.height, { samples: 4 })

  textureEff.setTexture(fbo.texture)

  let editTunnel = useStore((r) => r.editTunnel) || null

  useFrame(({ gl }) => {
    gl.setRenderTarget(fbo)

    gl.setClearColor('#000000', 0)
    gl.clear(true, true, true)
    gl.render(sceneFBO, camera)

    gl.setRenderTarget(null)

    //
  })

  return (
    <>
      {createPortal(
        <group>
          {/*  */}
          {/*  */}
          {editTunnel}
          {/*  */}
        </group>,
        sceneFBO,
      )}
    </>
  )
}
