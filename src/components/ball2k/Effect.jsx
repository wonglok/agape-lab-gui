import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { ColorManagement, FloatType } from 'three'
import { SSGIDebugGUI } from './SSGIDebug'
import { Clock } from 'three'
// import 'three/examples/jsm/objects/'
import { GroundProjectedEnv } from 'three/examples/jsm/objects/GroundProjectedEnv.js'
import { useEnvironment } from '@react-three/drei'

const options = {
  distance: 2.7200000000000104,
  autoThickness: false,
  thickness: 1.2999999999999972,
  maxRoughness: 1,
  blend: 0.925,
  denoiseIterations: 3,
  denoiseKernel: 3,
  denoiseDiffuse: 40,
  denoiseSpecular: 40,
  depthPhi: 5,
  normalPhi: 28,
  roughnessPhi: 18.75,
  envBlur: 0.55,
  directLightMultiplier: 1,
  maxEnvLuminance: 50,
  steps: 20,
  refineSteps: 4,
  spp: 1,
  resolutionScale: 1,
  missedRays: false,
}
export function Effect() {
  // let [st, setST] = useState(false)
  let gl = useThree((s) => s.gl)
  let scene = useThree((s) => s.scene)
  let camera = useThree((s) => s.camera)

  let env = useEnvironment({ preset: 'dawn' })
  let ref = useRef(false)
  useEffect(() => {
    if (ref.current) {
      return
    }
    ref.current = true
    // ColorManagement.enabled = true
    //

    let clean = () => {}
    // import * as  from 'postprocessing'
    import('realism-effects').then(async (realism) => {
      let EffectComposer = await import('postprocessing').then((r) => r.EffectComposer)
      let EffectPass = await import('postprocessing').then((r) => r.EffectPass)
      let { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } = realism

      const composer = new EffectComposer(gl, { multisampling: 4, alpha: true })

      const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
      composer.addPass(velocityDepthNormalPass)

      let envMesh = new GroundProjectedEnv(env, { height: 50, radius: 50 })
      scene.add(envMesh)
      // SSGI
      const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, options)

      let yo = new SSGIDebugGUI(ssgiEffect, options)

      // // TRAA
      // const traaEffect = new TRAAEffect(scene, camera, velocityDepthNormalPass)

      // // Motion Blur
      // const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass)

      // const effectPass = new EffectPass(gl, ssgiEffect, traaEffect, motionBlurEffect)
      const effectPass = new EffectPass(gl, ssgiEffect)

      effectPass.enabled = true
      composer.addPass(effectPass)

      let rAFID = 0
      let clock = new Clock()
      let rAF = () => {
        rAFID = requestAnimationFrame(rAF)
        //
        composer.render(clock.getDelta())
      }
      rAFID = requestAnimationFrame(rAF)

      clean = () => {
        cancelAnimationFrame(rAFID)
        ref.current = false
        envMesh.removeFromParent()
      }

      // setST(composer)
    })

    return () => {
      clean()
    }
  }, [camera, env, gl, scene])

  useFrame(() => {
    // if (st) {
    //   st.render()
    // }
  }, 100)
  return <group></group>
}
