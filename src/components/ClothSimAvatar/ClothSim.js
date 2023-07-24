import { Box, MeshDiscardMaterial, OrbitControls, PerspectiveCamera, Sphere } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { MyCloth } from './MyCloth'
import { WorldBirdy } from '../worldbirdy/WorldBirdy'
import { WaterSurfaceAvatarContent } from '../WaterSurfaceAvatar/WaterSurfaceAvatar'

export function ClothSim() {
  //

  let gl = useThree((s) => s.gl)
  // let mouse = useThree((s) => s.mouse)
  let [ready, setReady] = useState(false)
  let point = new Vector3(0, 100, 0)
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
        <group position={[0, 0, 0]}>
          {ready && <YoYo key={ready} gl={gl} point={point} ready={ready}></YoYo>}
          {/*  */}
        </group>
      </group>

      {/* <gridHelper position={[0, 1, 0]} args={[50, 10, 0xff0000, 0xffff00]}></gridHelper> */}
      {/* <Box></Box> */}
      <group position={[0, -0.5, 0]}>
        <group rotation={[Math.PI * -0.5, 0, 0]}>
          <WaterSurfaceAvatarContent point={point}></WaterSurfaceAvatarContent>
        </group>
      </group>

      <WorldBirdy point={point}></WorldBirdy>
    </group>
  )
}

function YoYo({ gl, point, ready }) {
  let ref = useRef()
  useEffect(() => {}, [])
  /*
      onClick={() => {
        ref.current.load()
      }}
  */
  return (
    <group>
      <myCloth
        ref={ref}
        args={[{ gl, mouse: point }]}
        dispose={function () {
          this.dispose()
        }}
        key={MyCloth.key + ready}></myCloth>
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
