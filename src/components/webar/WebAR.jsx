import { useEffect, useMemo, useRef, useState } from 'react'
import { MyView } from './MyView.js'
import { DeviceOrientationSensor } from './assets/orientation.js'
import { AlvaARConnectorTHREE } from './assets/alva_ar_three.js'
import { Canvas, createPortal, useFrame } from '@react-three/fiber'
import { Box, Environment, OrbitControls, PerspectiveCamera, Plane, Sphere } from '@react-three/drei'
import { BoxGeometry, MathUtils, Mesh, Quaternion, Scene, Vector3 } from 'three'
// import { Euler } from 'three'
// import { ShadowMaterial } from 'three'
// import { PlaneGeometry } from 'three'
// import { PointLight } from 'three'
import { CircleGeometry } from 'three'
// import { WorldBirdy } from '../worldbirdy/WorldBirdy.jsx'
// import { GLBLoader } from '../loader/GLBLoader.jsx'
// import { DirectionalLight } from 'three'
// import { Garage } from './Garage/Garage.jsx'
// import { EnvSSR } from './RealismEffect/EnvSSR.jsx'
// import { Genesis } from './Genesis/Genesis.jsx'
import { Object3D } from 'three'
// import { Matrix4 } from 'three'
import { PerspectiveCamera as TPCam } from 'three'
// import { LoaderGLB } from './MetaOnline/LoaderGLB.jsx'
import { MetaverseGLB } from './MetaOnline/MetaverseGLB.jsx'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { AvatarGuide } from '../worldbirdy/AvatarGuide.jsx'
import { JoyStick } from './MetaOnline/Joystick.jsx'
import { JoyStickBasic } from './MetaOnline/JoyStickBasic.jsx'
import { sceneToCollider } from './MetaOnline/sceneToCollider.js'

export function WebAR() {
  const [joyState, setJoyState] = useState()

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
          // oriControls.alphaOffset = Math.PI * 0.5

          // let myQuaterDisable = new Quaternion()

          oriControls.connect()

          let qq = new Quaternion()
          let vv = new Vector3()
          onFrame(() => {
            internalCamera.getWorldQuaternion(self.camera.quaternion)
            // .copy(.quaternion)

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
                  // const plane = alva.findPlane(frame)

                  // if (plane) {
                  //   // gridRef.current.position.set(plane[12], plane[13], plane[14])
                  //   // console.log(plane[12], plane[13], plane[14])
                  // }

                  // console.log(pose)

                  // let m4 = matrix4.fromArray(pose)
                  // matrix4.transpose()
                  /** @type {TPCam} */
                  // let cam = cameraRef.current
                  // cam.position.set(pose[12], pose[13], pose[14])

                  //
                  if (cameraRef.current.fov !== alva.intrinsics.fov) {
                    cameraRef.current.fov = alva.intrinsics.fov
                    cameraRef.current.updateProjectionMatrix()
                  }

                  applyPose(pose, qq, vv)

                  qq.normalize()
                  cameraRef.current.quaternion.normalize()
                  cameraRef.current.quaternion.slerp(qq, 0.4)

                  cameraRef.current.position.lerp(vv, 0.4)
                  oriControls.update()
                }
              } else {
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
                // alva.findFloor()
                // cameraRef.current.rotation.set(0, 0, 0, 'XYZ')
                // cameraRef.current.position.set(0, 1, 5)
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
          <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
            <canvas
              ref={canvasRef}
              className=''
              style={{ width: '100%', height: '100%', transform: `scale(1)` }}></canvas>
          </div>
          <div ref={containerRef} className='absolute top-0 left-0 w-full h-full'>
            <Canvas shadows>
              <group position={[0, 3, 6]}>
                <PerspectiveCamera fov={45} makeDefault far={500} near={0.1} ref={cameraRef}></PerspectiveCamera>
              </group>

              {/* <gridHelper ref={gridRef} args={[100, 100]}></gridHelper> */}

              <mesh receiveShadow={true} geometry={plane}>
                <shadowMaterial opacity={0.5}></shadowMaterial>
              </mesh>
              {/* <mesh position={[0, -0.1, 0]} geometry={plane}>
                <meshStandardMaterial color={'white'} roughness={0.6} transparent opacity={0.5}></meshStandardMaterial>
              </mesh> */}

              <Sphere position={[0, 0, -3]} castShadow scale={0.25}>
                <meshNormalMaterial></meshNormalMaterial>
              </Sphere>

              <Sphere position={[0, 3, -3]} castShadow scale={0.25}>
                <meshNormalMaterial></meshNormalMaterial>
              </Sphere>

              <Sphere position={[3, 3, -3]} castShadow scale={0.25}>
                <meshNormalMaterial></meshNormalMaterial>
              </Sphere>

              <Sphere position={[-3, 3, -3]} castShadow scale={0.25}>
                <meshNormalMaterial></meshNormalMaterial>
              </Sphere>

              <Environment preset='night'></Environment>
              {joyState && <Content joy={joyState}></Content>}
              {/* <Garage></Garage> */}

              {/* <EnvSSR></EnvSSR> */}

              {/* {<WorldBirdy></WorldBirdy>} */}
            </Canvas>
          </div>

          <JoyStickBasic
            onGame={({ state }) => {
              //
              setJoyState(state)
            }}></JoyStickBasic>

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
              className='absolute top-0 right-0 p-2 bg-white'
              onClick={() => {
                api.reset()

                cameraRef.current.position.fromArray(initPos)
                cameraRef.current.lookAt(initLookAt[0], initLookAt[1], initLookAt[2])
              }}>
              Reset
            </button>
          )}
        </>
      }
    </>
  )
}

function Content({ joy }) {
  let glb = useMemo(() => {
    let scene = new Scene()
    let plane = new Mesh(new BoxGeometry(100, 0.01, 100))

    plane.visible = false
    scene.add(plane)
    return {
      scene,
    }
  }, [])

  let colliderProm = useMemo(() => {
    return sceneToCollider({ scene: glb.scene })
  }, [glb])

  let [collider, setCollider] = useState(false)

  useEffect(() => {
    colliderProm.then((v) => {
      //
      setCollider(v)
    })
  }, [colliderProm])

  let player = useMemo(() => {
    return new Object3D()
  }, [])

  useFrame(() => {
    if (joy.isDown) {
      player.position.x += -joy.xAxis * 1.4
      player.position.z += -joy.yAxis * 1.4
      //colliderProm
    }
  })

  return (
    <>
      <group>
        {createPortal(
          <>
            <Sphere scale={0.3}></Sphere>
          </>,
          player,
        )}
        <primitive object={player}></primitive>
        {collider && (
          <AvatarGuide
            offset={[0, 2, -2]}
            chaseDist={0.35}
            speed={1.5}
            destObj={player}
            collider={collider}
            avatarUrl={`/2022/03/18/floor/xr/skycity/lok-dune.glb`}
            onACore={(aCore) => {
              return <group>{/* <BirdCamSync player={aCore.player}></BirdCamSync> */}</group>
            }}></AvatarGuide>
        )}
      </group>
    </>
  )
}
