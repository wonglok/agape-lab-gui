import { Box, Environment, OrbitControls, Sphere } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Matrix4, Object3D, Quaternion, Vector3 } from 'three'
import { create } from 'zustand'

let useLink = create((set, get) => {
  return {
    all: [],
    lights: [],
  }
})

export default function WebSocketPage() {
  return (
    <div className='w-full h-full'>
      {/*  */}
      <button
        className='p-2 m-1 bg-gray-300'
        onClick={() => {
          //
          let ws = new WebSocket(`ws://localhost:8765`)

          ws.addEventListener('open', (ev) => {
            let rAF = () => {
              requestAnimationFrame(rAF)
              ws.send('list:lights')
              ws.send('list:all')
            }
            requestAnimationFrame(rAF)
          })

          let o3 = new Object3D()
          let m4 = new Matrix4()
          m4.fromArray([1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1])
          m4.invert()

          ws.addEventListener('message', (ev) => {
            // console.log('receive data from blender', JSON.parse(ev.data))

            let json = JSON.parse(ev.data)

            json.data = json.data.map((it) => {
              o3.up.set(0, 0, 1)

              o3.position.fromArray(it.position)
              o3.scale.fromArray(it.scale)
              o3.quaternion.fromArray(it.quaternion)

              o3.applyMatrix4(m4)
              o3.updateMatrix()

              it.scale = o3.scale.toArray()
              it.position = o3.position.toArray()
              it.quaternion = o3.quaternion.toArray()

              return it
            })

            if (json.type === 'list:lights') {
              useLink.setState({ lights: json.data })
            }
            if (json.type === 'list:all') {
              useLink.setState({ all: json.data })
            }
          })
        }}>
        sync
      </button>

      <Canvas className='w-full h-full'>
        <Environment preset='apartment' background></Environment>
        <Content></Content>
        <OrbitControls object-position={[0, 0, 20]} target={[0, 0, 0]}></OrbitControls>
      </Canvas>

      {/*  */}
      {/*  */}
    </div>
  )
}

function Content() {
  let all = useLink((r) => r.all)
  let lights = useLink((r) => r.lights)

  return (
    <group>
      {all
        .filter((r) => r.type === 'MESH')
        .map((item) => {
          return (
            <group position={item.position} scale={item.scale} quaternion={item.quaternion} key={item.name + 'empty'}>
              <Box>
                <meshStandardMaterial color={'white'}></meshStandardMaterial>
              </Box>
            </group>
          )
        })}
      {all
        .filter((r) => r.type === 'LIGHT')
        .map((item) => {
          return (
            <group position={item.position} scale={item.scale} quaternion={item.quaternion} key={item.name + 'empty'}>
              <Sphere>
                <meshStandardMaterial wireframe color={'red'}></meshStandardMaterial>
              </Sphere>
            </group>
          )
        })}

      {lights.map((item) => {
        return (
          <group position={item.position} scale={item.scale} quaternion={item.quaternion} key={item.name + 'lights'}>
            <pointLight color={'red'} intensity={1} />
          </group>
        )
      })}
    </group>
  )
}
