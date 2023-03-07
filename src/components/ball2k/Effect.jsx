import { useEnvironment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Clock, Color, DoubleSide, EquirectangularReflectionMapping, sRGBEncoding } from 'three'
import { PMREMGenerator } from 'three'
import { TextureLoader } from 'three'
import { Mesh } from 'three'
import { SphereGeometry } from 'three'
import { MeshPhysicalMaterial } from 'three'

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

export function Effect() {
  // let [st, setST] = useState(false)
  let gl = useThree((s) => s.gl)
  let scene = useThree((s) => s.scene)
  let camera = useThree((s) => s.camera)

  let envMap = useEnvironment({ preset: 'dawn' })
  envMap.mapping = EquirectangularReflectionMapping
  scene.environment = envMap

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
    import('./realism/index').then(async (realism) => {
      const pmremGenerator = new PMREMGenerator(gl)
      pmremGenerator.compileEquirectangularShader()

      let EffectComposer = await import('postprocessing').then((r) => r.EffectComposer)
      let EffectPass = await import('postprocessing').then((r) => r.EffectPass)
      let { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } = realism

      const composer = new EffectComposer(gl, { multisampling: 4, alpha: true })

      const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
      composer.addPass(velocityDepthNormalPass)

      const ssgiEffect = new SSGIEffect(scene, camera, velocityDepthNormalPass, options)

      // // // TRAA
      // const traaEffect = new TRAAEffect(scene, camera, velocityDepthNormalPass)

      // // // Motion Blur
      const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass)

      // const effectPass = new EffectPass(gl, ssgiEffect, traaEffect, motionBlurEffect)
      const effectPass = new EffectPass(gl, ssgiEffect)

      // let yo = new SSGIDebugGUI(ssgiEffect)

      let texture = await new TextureLoader().loadAsync(`/envMap/ma-galaxy.jpg`)
      texture.mapping = EquirectangularReflectionMapping
      texture.encoding = sRGBEncoding

      scene.background = texture
      scene.environment = texture

      let envMesh = new Mesh(
        new SphereGeometry(5, 32, 32),
        new MeshPhysicalMaterial({
          transmission: 0,
          roughness: 0.1,
          metalness: 0.3,
          side: DoubleSide,
          map: texture,
          envMapIntensity: 3,
          color: new Color('#ffffff'),
          emissiveMap: texture,
          emissiveIntensity: 15,
          emissive: new Color('#ffffff'),
        }),
      )

      envMesh.position.y = -1.5
      scene.add(envMesh)

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
  }, [camera, gl, scene])

  useFrame(() => {
    // if (st) {
    //   st.render()
    // }
  }, 100)
  return (
    <group>
      {/* <hemisphereLight args={[0xffffff, 0xffffff]}></hemisphereLight>
      <pointLight color={'#ffffff'} position={[0, 1, -1]} intensity={30}></pointLight> */}
    </group>
  )
}
