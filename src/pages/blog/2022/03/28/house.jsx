import { Box, Environment, OrbitControls, Sphere } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect } from 'react'
import { Color, Matrix4, Object3D, Quaternion, Vector3 } from 'three'
import { create } from 'zustand'
import ReconnectingWebSocket from 'reconnecting-websocket'
let useLink = create((set, get) => {
  return {
    all: [],
  }
})

export default function WebSocketPage() {
  let setup = () => {
    let ws = null
    let rAFID = 0

    let connect = () => {
      ws = new ReconnectingWebSocket(`ws://localhost:8765`)
      ws.addEventListener('open', (ev) => {
        console.log(ev)
        let rAF = () => {
          rAFID = requestAnimationFrame(rAF)

          if (ws.readyState === ws.OPEN) {
            ws.send('list:all')
            // ws.send('patch:lights')
            // console.log('sending')
          } else if (ws.readyState === ws.CLOSED) {
            console.log('closed')

            cancelAnimationFrame(rAFID)
            setTimeout(() => {
              connect()
            }, 1000)
          } else if (ws.readyState === ws.CLOSING) {
            // console.log('closing')
          } else {
            // console.log('other')
          }
        }
        rAFID = requestAnimationFrame(rAF)
      })

      ws.onerror = (ev) => {
        console.log('error', ev)
      }

      let o3 = new Object3D()
      let m4 = new Matrix4()
      m4.fromArray([1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1])
      m4.invert()

      ws.addEventListener('message', (ev) => {
        // console.log('receive data from blender', JSON.parse(ev.data))

        let payload = JSON.parse(ev.data)

        payload.data = payload.data.map((it) => {
          o3.up.set(0, 0, 1)

          o3.position.fromArray(it.position)
          o3.scale.fromArray(it.scale)
          o3.scale.multiplyScalar(2)
          o3.rotation.fromArray(it.euler)

          o3.applyMatrix4(m4)
          o3.updateMatrix()

          it.scale = o3.scale.toArray()
          it.position = o3.position.toArray()
          it.quaternion = o3.quaternion.toArray()

          if (it.color) {
            it.color = '#' + new Color().fromArray(it.color).getHexString()
          }

          return it
        })

        if (payload.type === 'list:all') {
          useLink.setState({ all: payload.data })
        }
        // if (payload.type === 'list:lights') {
        //   // console.log(payload.type)
        //   // useLink.setState({ all: payload.data })
        //   // let all = useLink.getState().all
        //   // payload.data.forEach((it) => {
        //   //   console.log(it)
        //   // })
        //   // console.log(all, payload.data)
        //   // console.log(all)
        //   // all.forEach((it) => {
        //   //   let foundIdx = all.findIndex((e) => e.name === it.name)
        //   //   let found = all.find((e) => e.name === it.name)
        //   //   if (found && foundIdx !== -1) {
        //   //     all[foundIdx] = it
        //   //   }
        //   // })
        // }
      })
    }

    connect()
    return () => {}
  }

  useEffect(() => {
    return setup()
  }, [])

  return (
    <div className='w-full h-full'>
      <Canvas
        onCreated={(st) => {
          st.gl.physicallyCorrectLights = true
          st.gl.useLegacyLights = true
          // st.scene.background = new Color('#000000')
        }}
        className='w-full h-full'>
        <Environment preset='night' background></Environment>
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
                <meshStandardMaterial wireframe color={item.color}></meshStandardMaterial>
              </Sphere>
            </group>
          )
        })}

      {all
        .filter((r) => r.type === 'LIGHT')
        .map((item) => {
          return (
            <group position={item.position} scale={item.scale} quaternion={item.quaternion} key={item.name + 'lights'}>
              <pointLight color={item.color} intensity={1} power={item.power} />
            </group>
          )
        })}
    </group>
  )
}
