import { useEffect, useMemo, useRef, useState } from 'react'
import { MyView } from './MyView.js'
import { DeviceOrientationSensor } from './assets/orientation.js'
import { AlvaARConnectorTHREE } from './assets/alva_ar_three.js'
import { Canvas } from '@react-three/fiber'
import { Box, Environment, OrbitControls, PerspectiveCamera, Plane, Sphere } from '@react-three/drei'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { Euler } from 'three'
import { ShadowMaterial } from 'three'
import { PlaneGeometry } from 'three'
import { PointLight } from 'three'
import { CircleGeometry } from 'three'
import { WorldBirdy } from '../worldbirdy/WorldBirdy.jsx'
import { GLBLoader } from '../loader/GLBLoader.jsx'
import { DirectionalLight } from 'three'
import { Garage } from './Garage/Garage.jsx'
import { EnvSSR } from './RealismEffect/EnvSSR.jsx'
import { Genesis } from './Genesis/Genesis.jsx'
import { Object3D } from 'three'

export function WebAR() {
  let containerRef = useRef()
  let canvasRef = useRef()
  let initRef = useRef()
  let cameraRef = useRef()
  let [api, setAPI] = useState(null)
  useEffect(() => {
    //
    let cleans = []
    setAPI({
      start: async () => {
        // let { Stats } = await import('./assets/stats.js')
        // let { AlvaAR } = await import('./assets/alva_ar.js')
        let DeviceOrientationControls = await import('./DeviceOrientationControls.js').then(
          (r) => r.DeviceOrientationControls,
        )
        let { AlvaAR } = await window.remoteImport(`/ar/alva_ar.js`)
        // let { ARCamView } = await import('./assets/view.js')
        let { Camera, onFrame, resize2cover } = await import('./assets/utils.js')

        const config = {
          video: {
            facingMode: 'environment',
            aspectRatio: 16 / 9,
            width: { ideal: 1280 },
          },
          audio: false,
        }

        async function demo(media, sensor) {
          const $video = media.el
          let $container = containerRef.current
          let $canvas = canvasRef.current

          const ctx = $canvas.getContext('2d', { alpha: false, desynchronized: true })
          const size = resize2cover(
            $video.videoWidth,
            $video.videoHeight,
            $container.clientWidth,
            $container.clientHeight,
          )

          $canvas.width = $container.clientWidth
          $canvas.height = $container.clientHeight
          $video.style.width = size.width + 'px'
          $video.style.height = size.height + 'px'

          const alva = await AlvaAR.Initialize($canvas.width, $canvas.height)
          // const view = new MyView($container, $canvas.width, $canvas.height)

          let applyPose = AlvaARConnectorTHREE.Initialize()

          //cameraRef.current.quaternion

          const self = {
            camera: cameraRef.current,
            prevQuaternion: new Quaternion(),
            cameraPositionCurr: new Vector3(),
            cameraPositionPrev: new Vector3(),
          }

          let proxyCamera = self.camera.clone()

          let internalCamera = new Object3D()
          internalCamera.rotation.x = Math.PI * 0.5

          proxyCamera.add(internalCamera)

          let oriControls = new DeviceOrientationControls(proxyCamera)
          // oriControls.alphaOffset += Math.PI * 0.25

          //
          oriControls.connect()
          let myQuaterDisable = new Quaternion()

          onFrame(() => {
            internalCamera.getWorldQuaternion(self.camera.quaternion)
            // .copy(.quaternion)

            oriControls.update()

            // let aspect = $canvas.width / $canvas.height

            // Stats.next()
            // Stats.start('total')
            //

            ctx.clearRect(0, 0, $canvas.width, $canvas.height)

            if (!document['hidden']) {
              // Stats.start('video')
              ctx.drawImage(
                $video,
                0,
                0,
                $video.videoWidth,
                $video.videoHeight,
                size.x,
                size.y,
                size.width,
                size.height,
              )

              const frame = ctx.getImageData(0, 0, $canvas.width, $canvas.height)
              // Stats.stop('video')

              // Stats.start('slam')
              const pose = alva.findCameraPose(frame)
              // Stats.stop('slam')

              self.camera = cameraRef.current
              if (pose) {
                //
                if (cameraRef.current) {
                  applyPose(pose, myQuaterDisable, cameraRef.current.position)
                }
                // if (sensor) {
                //   let { alpha, beta, gamma, screenAngle } = sensor
                //   const orientation = MathUtils.degToRad(screenAngle)
                //   const axis = new Vector3(0, 0, 1)
                //   const euler = new Euler()
                //   const q0 = new Quaternion()
                //   const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis
                //   // 'ZXY' for the device, but 'YXZ' for us
                //   euler.set(beta, alpha, -gamma, 'YXZ')
                //   // orient the device
                //   self.camera.quaternion.setFromEuler(euler)
                //   // camera looks out the back of the device, not the top
                //   self.camera.quaternion.multiply(q1)
                //   // adjust for screen orientation
                //   self.camera.quaternion.multiply(q0.setFromAxisAngle(axis, -orientation))
                //   self.prevQuaternion = self.prevQuaternion || new THREE.Quaternion()
                //   if (8 * (1 - self.prevQuaternion.dot(self.camera.quaternion)) > 0.000001) {
                //     self.prevQuaternion.copy(self.camera.quaternion)
                //   }
                //   self.cameraPositionPrev.copy(self.cameraPositionCurr)
                //   if (pose) {
                //     applyPose(pose, null, self.cameraPositionCurr)
                //   }
                //   self.camera.position.set(
                //     self.camera.position.x + self.cameraPositionCurr.x - self.cameraPositionPrev.x,
                //     self.camera.position.y + self.cameraPositionCurr.y - self.cameraPositionPrev.y,
                //     self.camera.position.z + self.cameraPositionCurr.z - self.cameraPositionPrev.z,
                //   )
                // } else {
                //   if (cameraRef.current) {
                //     applyPose(pose, cameraRef.current.quaternion, cameraRef.current.position)
                //   }
                // }
                // if (sensor) {
                //   view.updateCameraPoseDeviceOrient(
                //     pose,
                //     sensor.deviceOrientationAlpha,
                //     sensor.deviceOrientationBeta,
                //     sensor.deviceOrientationGamma,
                //     sensor.screenOrientationAngle,
                //   )
                // } else {
                //   view.updateCameraPose(pose)
                // }
                // view.applyPose(pose, camera.quaternion, camera.position)
              } else {
                // view.lostCamera()

                const dots = alva.getFramePoints()

                for (const p of dots) {
                  ctx.fillStyle = 'white'
                  ctx.fillRect(p.x, p.y, 2, 2)
                }
              }
            }

            // Stats.stop('total')
            // Stats.render()

            return true
          }, 60)

          initRef.current.style.display = 'none'
          setAPI((r) => {
            return {
              ...r,
              reset: () => {
                alva.reset()
              },
            }
          })
        }

        try {
          // const sensor = await DeviceOrientationSensor.Initialize()
          const media = await Camera.Initialize(config)

          await demo(media)
        } catch (e) {
          console.log('sensor', e)
        }

        // sensorProm.then((sensor) => {
        // })
        // .catch((error) => alert('Camera ' + error))

        //
      },
    })

    return () => {
      cleans.forEach((it) => it())
    }
  }, [])

  let plane = useMemo(() => {
    const geometry = new CircleGeometry(100, 32)
    geometry.rotateX(-Math.PI / 2)
    return geometry
  }, [])

  return (
    <>
      {
        <>
          <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full'></canvas>
          <div ref={containerRef} className='absolute top-0 left-0 w-full h-full'>
            <Canvas shadows>
              <group position={[0, 2.5, 5]} rotation={[Math.PI * 0.0, 0, 0]}>
                <PerspectiveCamera fov={90} makeDefault far={500} near={0.1} ref={cameraRef}></PerspectiveCamera>
              </group>

              <gridHelper args={[100, 100]}></gridHelper>

              <mesh receiveShadow={true} geometry={plane}>
                <shadowMaterial opacity={0.5}></shadowMaterial>
              </mesh>
              {/* <mesh position={[0, -0.1, 0]} geometry={plane}>
                <meshStandardMaterial color={'white'} roughness={0.6} transparent opacity={0.5}></meshStandardMaterial>
              </mesh> */}

              <Sphere position={[0, 1, -1]} castShadow scale={0.25}>
                <meshNormalMaterial></meshNormalMaterial>
              </Sphere>

              <Environment preset='night'></Environment>

              <Garage></Garage>

              {/* <EnvSSR></EnvSSR> */}

              {/* {<WorldBirdy></WorldBirdy>} */}
            </Canvas>
          </div>
          <div ref={initRef} className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
            {api?.start && (
              <button
                className='px-5 py-2 bg-white rounded-xl'
                onClick={() => {
                  api.start()

                  setAPI((r) => {
                    return {
                      ...r,
                      start: false,
                    }
                  })
                }}>
                Start
              </button>
            )}
          </div>

          {api?.reset && (
            <button
              className='absolute top-0 right-0'
              onClick={() => {
                api.reset()
              }}>
              Reset
            </button>
          )}
        </>
      }
    </>
  )
}
