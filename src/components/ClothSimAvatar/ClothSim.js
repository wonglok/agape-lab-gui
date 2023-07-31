import { Box, MeshDiscardMaterial, OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Object3D, Vector3 } from 'three'
import { MyCloth, MyClothAva } from './MyCloth'
import { WorldBirdy } from '../worldbirdy/WorldBirdy'
import { WaterSurfaceAvatarContent } from '../WaterSurfaceAvatar/WaterSurfaceAvatar'
import { createPortal } from '@react-three/fiber'

export function ClothSim() {
  //

  let gl = useThree((s) => s.gl)
  // let mouse = useThree((s) => s.mouse)
  let [ready, setReady] = useState(false)
  let point = useMemo(() => new Vector3(0, 100, 0), [])

  let cape = useMemo(() => new Object3D(), [])

  useEffect(() => {
    setReady(Math.random())
  }, [])

  let wall = useRef()
  let ball = useRef()
  //
  useFrame((_) => {
    if (ball.current) {
      ball.current.position.copy(point)
    }
  })

  return (
    <group>
      {/*  */}
      {/*  */}

      {/* <OrbitControls target={[0, 0, 0]} object-position={[0, 0, 10]}></OrbitControls> */}
      {/* <Sphere ref={ball} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          //
          roughness={0}
          metalness={1}
          //
          transparent={true}></meshStandardMaterial>
      </Sphere> */}

      <group position={[0, 0, 0]}>
        {/* <Box
          //
          rotation={[0, 0, 0]}
          ref={wall}
          onPointerMove={(ev) => {
            if (ev.object) {
              // console.log(ev.point.x, ev.point.y, ev.point.z)
              point.copy(ev.point).addScaledVector(ev.face.normal, 0.1)
            }
          }}
          onPointerDown={(ev) => {
            // console.log(ev.point.x, ev.point.y, ev.point.z)

            if (ev.object) {
              point.copy(ev.point).addScaledVector(ev.face.normal, 0.1)
            }
            // point.copy(ev.point)
          }}
          position={[0, 0, 1]}
          args={[20, 20, 0.1]}>
          <MeshDiscardMaterial></MeshDiscardMaterial>
        </Box> */}
        {/*  */}
        {/* {createPortal(<group position={[0, 0, 0]} scale={0.1}></group>, cape)} */}
        {ready && <ClothObject cape={cape} key={ready} gl={gl} point={point} ready={ready}></ClothObject>}
      </group>

      {/* <gridHelper position={[0, 1, 0]} args={[50, 10, 0xff0000, 0xffff00]}></gridHelper> */}
      {/* <Box></Box> */}

      <group position={[0, -0.5, 0]}>
        <group rotation={[Math.PI * -0.5, 0, 0]}>
          <WaterSurfaceAvatarContent point={point}></WaterSurfaceAvatarContent>
        </group>
      </group>

      <group scale={[1, 1, 1]}>
        <WorldBirdy cape={cape} point={point}></WorldBirdy>
      </group>
    </group>
  )
}

function ClothObject({ gl, point, ready }) {
  let ref = useRef()
  useEffect(() => {}, [])

  return (
    <group>
      <myClothAva
        ref={ref}
        args={[{ gl, mouse: point }]}
        dispose={function () {
          this.dispose()
        }}
        key={MyClothAva.key + ready}></myClothAva>
    </group>
  )
}

//

//

//

//

//

//

//

//

//

//
