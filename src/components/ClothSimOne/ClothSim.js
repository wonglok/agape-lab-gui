import { Box, MeshDiscardMaterial, Sphere } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { MyCloth } from './MyCloth'

export function ClothSim() {
  //

  let gl = useThree((s) => s.gl)
  // let mouse = useThree((s) => s.mouse)
  let [ready, setReady] = useState(false)
  let point = new Vector3(0, -100, 200)
  useEffect(() => {
    setReady(Math.random())
  }, [])

  let wall = useRef()
  let ball = useRef()
  //
  useFrame((_) => {
    // if (wall.current) {
    //   // wall.current.lookAt(_.camera.position)
    // }
    if (ball.current) {
      ball.current.position.copy(point)
    }
  })
  return (
    <group>
      {/*  */}
      {/*  */}

      <Sphere ref={ball} args={[10, 32, 32]}>
        <meshStandardMaterial
          //
          roughness={0}
          metalness={1}
          //
          transparent={true}></meshStandardMaterial>
      </Sphere>
      <Box
        //
        rotation={[0, 0, 0]}
        ref={wall}
        onPointerMove={(ev) => {
          if (ev.object) {
            // console.log(ev.point.x, ev.point.y, ev.point.z)
            point.copy(ev.point).add(ev.face.normal)
          }
        }}
        onPointerDown={(ev) => {
          // console.log(ev.point.x, ev.point.y, ev.point.z)

          if (ev.object) {
            point.copy(ev.point).add(ev.face.normal)
          }
          // point.copy(ev.point)
        }}
        position={[0, 0, 10]}
        args={[200, 200, 0.1]}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>

      {/*  */}
      <group rotation={[0, 0, 0]}>
        {ready && <YoYo key={ready} gl={gl} point={point} ready={ready}></YoYo>}
        {/*  */}
      </group>
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
