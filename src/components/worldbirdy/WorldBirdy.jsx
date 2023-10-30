import { Collider } from './collider/Collider'
import { useGLBLoader } from './glb-loader/useGLBLoader'
// import { WalkerGame } from '@/lib/walker/WalkerGame'
// import { Avatar } from '../Avatar/Avatar'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import {
  // CubeCamera,
  // Environment,
  // MeshRefractionMaterial,
  // MeshTransMissionMaterial,
  // MeshTransmissionMaterial,
  OrbitControls,
  // useEnvironment,
} from '@react-three/drei'
// import { AvatarChaser } from '../AvatarChaser/AvatarChaser'
import { AvatarGuide } from './AvatarGuide'
import { useEffect, useMemo } from 'react'
import { Object3D, Vector3 } from 'three'
import { Mouse3D } from './noodles/Noodle/Mouse3D'
// import { Noodle } from '@/content-vfx/Noodle/Noodle'
// import { AvaZoom } from './AvaZoom'
import { BirdCamSync } from './BirdCamSync'
// import { clone } from 'three/examples/jsm/utils/SkeletonUtils'
// import { PlaneBufferGeometry } from 'three'
import { BoxBufferGeometry } from 'three' // DoubleSide
import { Mesh } from 'three'
import { MeshBasicMaterial } from 'three'
import { Color } from 'three'
import { Noodle } from './noodles/Noodle/Noodle'
// import { DirectionalLight } from 'three'
// import { PointLight } from 'three'
// import { ClothSim } from '../ClothSim/ClothSim'
// import { MeshReflectorMaterial } from '@react-three/drei'

export function WorldBirdy({ cape = new Object3D(), point = new Vector3() }) {
  let gl = useThree((s) => s.gl)
  let camera = useThree((s) => s.camera)

  let destObj = useMemo(() => {
    let dd = new Object3D()
    dd.position.y = 1.0
    return dd
  }, [])

  let clothes = [
    //
    `/2022/03/18/floor/xr/skycity/lok-dune.glb`,
    // `/2022/03/18/floor/xr/skycity/lok-jacket.glb`,
    // `/2022/03/18/floor/xr/skycity/lok-groom.glb`,
    // `/2022/03/18/floor/xr/skycity/lok-dark-armor.glb`,
  ]

  let makeFollower = (collider, level = 3, aCore) => {
    if (level < 0) {
      return null
    }

    window.follow = aCore.player

    return (
      <AvatarGuide
        cape={cape}
        offset={[0.01, 1, 0]}
        chaseDist={1.2}
        speed={aCore.playerSpeed * 0.98}
        destObj={aCore.player}
        collider={collider}
        avatarUrl={clothes[level % clothes.length]}
        onACore={(aCore) => {
          return <group>{makeFollower(collider, level - 1, aCore)}</group>
        }}></AvatarGuide>
    )
  }

  let colliderScene = new Object3D() // clone(glb.scene)
  let floor = new Mesh(
    new BoxBufferGeometry(2000, 0.1, 2000),
    new MeshBasicMaterial({ transparent: true, opacity: 0.5, color: new Color('#ffbaba') }),
  )
  floor.position.y = -0.52

  //
  // let querlo = useGLBLoader(`/2022/03/18/floor/xr/querlo.glb`)

  colliderScene.add(floor)
  // colliderScene.traverse((it) => {
  //   if (it.name === 'ground') {
  //     it.visible = false
  //   }
  // })

  // let cloneQuerlo = clone(querlo.scene)
  // colliderScene.add(cloneQuerlo)

  // let querlo2 = {
  //   scene: clone(querlo.scene),
  // }
  // querlo2.scene.position.x += 50
  // colliderScene.add(querlo2.scene)

  // let querlo3 = {
  //   scene: clone(querlo.scene),
  // }
  // querlo3.scene.position.x -= 50
  // colliderScene.add(querlo3.scene)

  // let island = cloneQuerlo.getObjectByName('island')

  /*

    <MeshTransmissionMaterial
            {...{
              transmissionSampler: false,
              samples: 5,
              resolution: 512,
              transmission: 1,
              roughness: 0.3,
              thickness: 2.5,
              ior: 1.5,
              chromaticAberration: 0.26,
              anisotropy: 0.3,
              distortion: 0.3,
              distortionScale: 0.3,
              temporalDistortion: 0.5,
              attenuationDistance: 0.5,
              attenuationColor: '#ffffff',
              color: '#ffffff',
              side: DoubleSide,
            }}
          ></MeshTransmissionMaterial>*/
  // let tex = useEnvironment({ preset: 'apartment' })

  // let light = useMemo(() => {
  //   // Create a PointLight and turn on shadows for the light
  //   const light = new PointLight(0xffffff, 1, 100, 0.1)
  //   light.castShadow = true // default false

  //   //Set up shadow properties for the light
  //   light.shadow.mapSize.width = 1024 // default
  //   light.shadow.mapSize.height = 1024 // default
  //   light.shadow.camera.near = 0.2 // default
  //   light.shadow.camera.far = 1000 // default
  //   light.shadow.radius = 0.5

  //   return light
  // }, [])

  // useFrame(() => {
  //   light.shadow.camera.lookAt(destObj.position)
  // })

  let mouse = useThree((r) => r.mouse)

  return (
    <group>
      {
        // <group position={[0, 15, -15]}>
        //   <primitive object={light}></primitive>
        // </group>
      }

      {/* <primitive object={cloneQuerlo}></primitive> */}
      {/* <primitive object={querlo2.scene}> </primitive>
      <primitive object={querlo3.scene}> </primitive> */}

      {/* {island &&
        createPortal(
          <MeshRefractionMaterial
            side={DoubleSide}
            envMap={tex}
            bounces={5}
            ior={1.4}
            fresnel={0.1}
            aberrationStrength={0.1}
            color={'#ffffff'}
            fastChroma={true}
          ></MeshRefractionMaterial>,
          island
        )} */}

      {/*  */}

      <OrbitControls
        args={[camera, gl.domElement]}
        makeDefault
        enableRotate={false}
        enablePan={false}
        object-position={[0, 20, 40]}
        target={[0, 0, 0]}></OrbitControls>

      {/* <gridHelper
        rotation-y={Math.PI * 0.25}
        args={[300, 100, '#8F6A1A', '#8F6A1A']}
      /> */}

      <Collider
        scene={colliderScene}
        onReady={(collider) => {
          return (
            <group>
              {/* <primitive object={colliderScene}></primitive> */}
              <group
              // onClick={(ev) => {
              //   console.log(ev.object?.name)
              // }}
              >
                {/* <primitive object={showGLB}></primitive> */}
              </group>

              {/* <div></div> */}

              <AvatarGuide
                offset={[0, 2, 2]}
                chaseDist={1}
                speed={2}
                destObj={destObj}
                collider={collider}
                avatarUrl={`/2022/03/18/floor/xr/skycity/lok-dune.glb`}
                onACore={(aCore) => {
                  aCore.core.onLoop(() => {
                    point.lerp(aCore.player.position, 0.1)
                  })

                  return (
                    <group>
                      <BirdCamSync player={aCore.player}></BirdCamSync>

                      {/* {makeFollower(collider, 5, aCore)} */}
                    </group>
                  )
                }}>
                {/* {gl && <myClothAva gl={gl}></myClothAva>} */}
                {/*  */}
              </AvatarGuide>

              {/*  */}
              <Mouse3D collider={collider} mouse3d={destObj}></Mouse3D>

              {/*  */}
              {/* <AvaZoom mouse3d={destObj}></AvaZoom> */}

              {/*  */}
              <Noodle mouse3d={destObj}></Noodle>
            </group>
          )
        }}></Collider>

      {/* <Environment path={'https://lab.agape.land'} preset='apartment' background></Environment> */}
    </group>
  )
}
