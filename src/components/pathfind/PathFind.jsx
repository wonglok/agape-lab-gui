import { Box, Line, OrbitControls } from '@react-three/drei'
import { Canvas, useLoader } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { Pathfinding } from 'three-pathfinding'
import { OBJLoader } from 'three-stdlib'
import { Vector3 } from 'three147'
//https://github.com/but0n/recastCLI.js/tree/master
export function PathFind() {
  return (
    <Canvas>
      <Content></Content>
    </Canvas>
  )
}

function Content() {
  let obj = useLoader(OBJLoader, `/2022/04/25/pathfind/nyc-navmesh.obj`)
  let geo = useMemo(() => {
    let geo = null

    obj.traverse((it) => {
      if (it.geometry) {
        geo = it.geometry
      }
    })

    return geo
  }, [obj])

  const ZONE = 'level1'
  let find = useMemo(() => {
    // Create level.
    const pathfinding = new Pathfinding()
    pathfinding.setZoneData(ZONE, Pathfinding.createZone(geo))

    // Find path from A to B.

    return pathfinding
  }, [geo])

  console.log(find)
  let getPath = (aa, bb) => {
    let a = new Vector3(0, 0, 1)
    let b = new Vector3(0, 0, -2)

    if (aa) {
      a.copy(aa)
    }
    if (bb) {
      b.copy(bb)
    }
    let groupID = find.getGroup(ZONE, a)
    const pathway = find.findPath(a, b, ZONE, groupID)

    return pathway
  }

  let [ptsArray, setPTs] = useState(false)
  return (
    <>
      <group
        onClick={(ev) => {
          console.log(ev)

          let pointA = {
            x: 1.0252819641498725,
            y: 0.3865524487036964,
            z: 54.637000011841,
          }
          let pointB = ev.point // { x: 6.6767083212302145, y: 3.838402032852173, z: -45.90605990057587 }

          let res = getPath(pointA, pointB)

          if (res) {
            res.unshift(new Vector3().copy(pointA))
            setPTs(false)
            setTimeout(() => {
              let pts = res.map((r) => r.toArray())

              console.log(pts)
              setPTs(pts)
            }, 100)
          }
        }}>
        <primitive object={obj}></primitive>
      </group>

      <group position={[0, 1, 0]}>
        {ptsArray && (
          <Line
            points={ptsArray} // Array of points, Array<Vector3 | Vector2 | [number, number, number] | [number, number] | number>
            color='red' // Default
            lineWidth={3} // In pixels (default)
            dashed={true} // Default
          >
            <lineBasicMaterial color={'red'}></lineBasicMaterial>
          </Line>
        )}
      </group>
      <>
        {ptsArray &&
          ptsArray.map((r, i) => {
            return (
              <Box key={i} position={new Vector3().copy(r).toArray()}>
                <meshBasicMaterial color='red'></meshBasicMaterial>
              </Box>
            )
          })}
      </>
      <OrbitControls></OrbitControls>
    </>
  )
}
