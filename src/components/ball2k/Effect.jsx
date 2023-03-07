import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { ColorManagement, FloatType } from 'three'
// import 'three/examples/jsm/objects/'

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
  missedRays: true,
}

export function Effect() {
  // let [st, setST] = useState(false)
  let gl = useThree((s) => s.gl)
  let scene = useThree((s) => s.scene)
  let camera = useThree((s) => s.camera)

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

      // SSGI
      const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, options)

      // // TRAA
      // const traaEffect = new TRAAEffect(scene, camera, velocityDepthNormalPass)

      // // Motion Blur
      // const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass)

      // const effectPass = new EffectPass(gl, ssgiEffect, traaEffect, motionBlurEffect)
      const effectPass = new EffectPass(gl, ssgiEffect)

      effectPass.enabled = true
      composer.addPass(effectPass)

      let rAFID = 0
      let rAF = () => {
        rAFID = requestAnimationFrame(rAF)
        //
        composer.render(1 / 60)
      }
      rAFID = requestAnimationFrame(rAF)

      clean = () => {
        cancelAnimationFrame(rAFID)
        ref.current = false
      }

      // setST(composer)
    })

    return () => {
      clean()
    }
  }, [camera, gl, scene])

  useFrame(() => {
    // if (st) {
    //   st.render()
    // }
  }, 100)
  return (
    <group>
      <pointLight position={[0, 1, 1]} color={'#ffffff'} intensity={3}></pointLight>
    </group>
  )
}
