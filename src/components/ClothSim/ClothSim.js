import { Box, MeshDiscardMaterial, Sphere } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { MyCloth } from './MyCloth'

export function ClothSim({ idx, sharedPoint }) {
  //
  let ref = useRef()
  let gl = useThree((s) => s.gl)
  // let mouse = useThree((s) => s.mouse)
  let [ready, setReady] = useState(false)
  // let point = useMemo(() => {
  //   let yo = sharedPoint || new Vector3(0, -100, 200)
  //   window.yo = window.yo || yo
  //   return window.yo
  // }, [sharedPoint])

  //
  useEffect(() => {
    setReady(Math.random())
  }, [])

  let wall = useRef()
  let ball = useRef()
  //
  let tt = new Vector3()
  useFrame((_) => {
    // if (wall.current) {
    //   // wall.current.lookAt(_.camera.position)
    // }
    if (ball.current) {
      if (ref.current) {
        tt.copy(sharedPoint)

        ref.current.worldToLocal(tt)

        ball.current.position.copy(tt)
      }
    }
  })
  return (
    <group ref={ref}>
      {/*  */}
      {/*  */}

      <Sphere ref={ball} visible={true} args={[10, 32, 32]}>
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
        visible={true}
        // onPointerMove={(ev) => {
        //   if (ev.object) {
        //     // console.log(ev.point.x, ev.point.y, ev.point.z)
        //     point.copy(ev.point).addScaledVector(ev.face.normal, 5)
        //   }
        // }}
        // onPointerDown={(ev) => {
        //   // console.log(ev.point.x, ev.point.y, ev.point.z)

        //   if (ev.object) {
        //     point.copy(ev.point).addScaledVector(ev.face.normal, 5)
        //   }
        //   // point.copy(ev.point)
        // }}
        position={[0, 0, 10]}
        args={[200, 200, 0.1]}
        scale={2}>
        <MeshDiscardMaterial></MeshDiscardMaterial>
      </Box>

      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      <group rotation={[0, 0, 0]}>
        {ready && <YoYo key={ready} gl={gl} point={tt} ready={ready}></YoYo>}
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
    <group scale={0.75}>
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
