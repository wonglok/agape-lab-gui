import { Box, Environment, OrbitControls, Sphere } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo } from 'react'
import { BufferAttribute, BufferGeometry, Color, Matrix4, Object3D, ObjectLoader, Quaternion, Vector3 } from 'three'
import { create } from 'zustand'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { OBJLoader } from 'three-stdlib'
let useLink = create((set, get) => {
  return {
    all: [],
    geo: [],
  }
})

export default function WebSocketPage() {
  let setup = () => {
    let ws = null
    let rAFID = 0

    let connect = () => {
      ws = new ReconnectingWebSocket(`ws://localhost:8765`)
      ws.addEventListener('open', (ev) => {
        // console.log(ev)

        ws.send('geo:all')

        let geoTT = setInterval(() => {
          ws.send('geo:all')
        }, 1000)

        let rAF = () => {
          rAFID = requestAnimationFrame(rAF)

          if (ws.readyState === ws.OPEN) {
            ws.send('list:all')

            // ws.send('patch:lights')
            // console.log('sending')
          } else if (ws.readyState === ws.CLOSED) {
            console.log('closed')
            clearInterval(geoTT)
            cancelAnimationFrame(rAFID)
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

      let objLoader = new OBJLoader()
      ws.addEventListener('message', async (ev) => {
        // console.log('receive data from blender', JSON.parse(ev.data))

        let payload = JSON.parse(ev.data)

        if (payload.type === 'geo:all') {
          // console.log(payload.data)

          // let url = URL.createObjectURL(new Blob([payload.data]))
          let results = await objLoader.parse(payload.data)

          let geos = []

          results.traverse((it) => {
            if (it.geometry) {
              // it.geometry.applyMatrix4(m4)

              it.geometry.rotateX(Math.PI * 0.5)
              // it.geometry.rotateZ(Math.PI * 0.5)
              geos.push({
                name: it.name,
                geometry: it.geometry,
              })
            }
          })

          useLink.setState({ geo: geos })
        }

        if (payload.type === 'list:all') {
          payload.data = payload.data.map((it) => {
            o3.up.set(0, 0, 1)

            o3.position.fromArray(it.position)
            o3.scale.fromArray([it.scale[0], it.scale[1], it.scale[2]])
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

          useLink.setState({ all: payload.data })
        }

        //
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

function GeoStream({ name }) {
  let geo = useLink((r) => r.geo)

  let item = geo.find((g) => g.name === name)

  // console.log(item)

  return (
    <>
      {item && (
        <mesh geometry={item.geometry}>
          <meshStandardMaterial color={'white'}></meshStandardMaterial>
        </mesh>
      )}
    </>
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
              <GeoStream name={item.name}></GeoStream>

              {/* <Box>
                <meshStandardMaterial color={'white'}></meshStandardMaterial>
              </Box> */}
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
