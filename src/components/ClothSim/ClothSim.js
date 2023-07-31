import { Box, MeshDiscardMaterial, Sphere } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { MyCloth } from './MyCloth'

export function ClothSim({ idx, canRun, sharedPoint }) {
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
    if (canRun) {
      setReady(Math.random())
    }
  }, [canRun])

  let wall = useRef()

  return (
    <group ref={ref}>
      {/*  */}
      {/*  */}

      {/* <Sphere ref={ball} visible={true} args={[10, 32, 32]}>
        <meshStandardMaterial
          //
          roughness={0}
          metalness={1}
          //
          transparent={true}></meshStandardMaterial>
      </Sphere> */}

      <group scale={0.5} rotation={[0, 0, ((Math.PI * 2.0) / 7) * idx]}>
        <group scale={[1, 1, 1]} position={[0, 0, 0]} rotation={[-0.65, 0, -0.25]}>
          <Box
            //
            rotation={[0, 0, 0]}
            ref={wall}
            visible={true}
            onPointerMove={(ev) => {
              if (ev.object) {
                // console.log(ev.point.x, ev.point.y, ev.point.z)
                sharedPoint.copy(ev.point)
                ref.current.worldToLocal(sharedPoint)
              }
            }}
            onPointerDown={(ev) => {
              // console.log(ev.point.x, ev.point.y, ev.point.z)

              if (ev.object) {
                sharedPoint.copy(ev.point)
                ref.current.worldToLocal(sharedPoint)
              }
              // point.copy(ev.point)
            }}
            position={[0, 0, -400]}
            args={[300, 400, 0.1]}
            scale={1}>
            <meshStandardMaterial metalness={1} roughness={0.0}></meshStandardMaterial>
            {/* <MeshDiscardMaterial></MeshDiscardMaterial> */}
          </Box>
        </group>
      </group>

      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      <group rotation={[0, 0, 0]}>
        {ready && canRun && <YoYo key={ready} gl={gl} point={sharedPoint} ready={ready}></YoYo>}
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
    <group scale={1}>
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
