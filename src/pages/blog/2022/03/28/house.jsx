import { Box, Environment, OrbitControls, Sphere } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  ObjectLoader,
  Quaternion,
  Scene,
  Vector3,
} from 'three'
import { create } from 'zustand'
import ReconnectingWebSocket from 'reconnecting-websocket'
import { OBJLoader, PLYLoader } from 'three-stdlib'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
let useLink = create((set, get) => {
  return {
    all: [],
    listGeo: [],
    geoList: [],
    scene: new Scene(),
  }
})

export default function WebSocketPage() {
  useEffect(() => {
    let send = () => console.log('no-op')

    let hh = (ev) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key === 's') {
        ev.preventDefault()
        send()
      }
    }

    //
    window.addEventListener('keydown', hh)

    let ws = null
    let rAFID = 0

    let connect = () => {
      ws = new ReconnectingWebSocket(`ws://localhost:8765`)
      ws.addEventListener('open', (ev) => {
        // console.log(ev)

        ws.send('geo:all')

        send = () => {
          ws.send('geo:all')
        }

        let rAF = () => {
          rAFID = requestAnimationFrame(rAF)

          if (ws.readyState === ws.OPEN) {
            ws.send('list:all')

            // ws.send('patch:lights')
            // console.log('sending')
          } else if (ws.readyState === ws.CLOSED) {
            console.log('closed')

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
      let gltfLoader = new GLTFLoader()
      let plyLoader = new PLYLoader()

      const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
        const byteCharacters = atob(b64Data)
        const byteArrays = []

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize)

          const byteNumbers = new Array(slice.length)
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
          }

          const byteArray = new Uint8Array(byteNumbers)
          byteArrays.push(byteArray)
        }

        const blob = new Blob(byteArrays, { type: contentType })
        return blob
      }

      ws.addEventListener('message', async (ev) => {
        // console.log('receive data from blender', JSON.parse(ev.data))

        let payload = JSON.parse(ev.data)

        if (payload.type === 'list:ply') {
          // console.log(payload.data)

          let geoList = payload.data.map((it) => {
            let geo = plyLoader.parse(it.ply)
            it.geo = geo
            it.matchName = it.name.replace('.', '_') + '_' + it.dataName.replace('.', '_')
            return it
          })

          console.log(geoList)
          // let loader = plyLoader.parse(payload.data)
          // console.log(loader)
          useLink.setState({ geoList: geoList })
        }

        if (payload.type === 'list:geo') {
          useLink.setState({ listGeo: payload.data })
        }
        // console.log(payload.data)

        if (payload.type === 'geo:all') {
          // let buffer = window.atob(payload.data)
          // console.log(atob(payload.data.slice(1, payload.data.length - 2)))

          let blob = b64toBlob(payload.data, 'data:application/octet-stream')

          // console.log(await blob.arrayBuffer())
          // let url = `data:application/octet-stream;base64,${payload.data}`

          // let url = URL.createObjectURL(new Blob([payload.data]))
          let glb = await gltfLoader.parseAsync(await blob.arrayBuffer(), '/')
          //
          // results.traverse((it) => {
          //   if (it.geometry) {
          //     it.geometry.computeBoundingSphere()
          //     let v3 = it.geometry.boundingSphere.center.clone()
          //     it.geometry.center()
          //     it.position.add(v3)
          //     it.geometry.computeBoundingSphere()
          //     // it.material = new MeshBasicMaterial({})
          //   }
          // })
          //
          useLink.setState({ scene: glb.scene })
          // let geos = []
        }

        if (payload.type === 'list:all') {
          payload.data = payload.data.map((it) => {
            // // o3.up.set(0, 0, 1)

            o3.position.fromArray(it.position)
            o3.scale.fromArray([it.scale[0], it.scale[1], it.scale[2]])
            o3.rotation.fromArray(it.euler)

            o3.applyMatrix4(m4)
            // o3.updateMatrix()

            it.scale = o3.scale.toArray()
            it.position = o3.position.toArray()
            it.quaternion = o3.quaternion.toArray()

            // if (it.color) {
            //   it.color = '#' + new Color().fromArray(it.color).getHexString()
            // }

            // console.log(it.name)

            // console.log(it.name)

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
    return () => {
      cancelAnimationFrame(rAFID)
      window.removeEventListener('keydown', hh)
    }
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

function AutoPatch({ item }) {
  let scene = useThree((r) => r.scene)
  let m4 = useMemo(() => {
    let m4 = new Matrix4()
    m4.fromArray([1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1])
    m4.invert()

    return m4
  }, [])

  let r4 = useMemo(() => {
    return new Matrix4()
  }, [])
  let o3 = useMemo(() => new Object3D(), [])

  useFrame(() => {
    scene.traverse((it) => {
      if (it.geometry) {
        if (it.name === `${item.name}_${item.dataName}`) {
          it.position.fromArray(item.position)
          it.scale.fromArray(item.scale)
          it.quaternion.fromArray(item.quaternion)

          // console.log(it.name, `${item.name}_${item.dataName}`)
          // o3.position.fromArray(item.position)
          // o3.position.applyMatrix4(m4)
          // o3.scale.fromArray([item.scale[0], item.scale[2], item.scale[1]])
          // o3.scale.applyMatrix4(m4)
          // o3.quaternion.fromArray(item.quaternion)
          // r4.identity()
          // r4.extractRotation(m4)
          // o3.quaternion.setFromRotationMatrix(r4)
          // //
          // it.position.copy(o3.position)
          // it.scale.set(o3.scale)
          // it.quaternion.copy(o3.quaternion)
        }
      }
    })
  })

  return <group></group>
}

function AutoGeo({ item }) {
  return (
    <mesh geometry={item.geo} name={item.matchName}>
      <meshStandardMaterial color={'white'}></meshStandardMaterial>
    </mesh>
  )
}

function Content() {
  let all = useLink((r) => r.all)
  let scene = useLink((r) => r.scene)
  let geoList = useLink((r) => r.geoList)
  return (
    <group>
      {<primitive object={scene}></primitive>}

      {geoList.map((item) => {
        return (
          <group key={item.name + 'empty'}>
            <AutoGeo item={item}></AutoGeo>
          </group>
        )
      })}

      {geoList
        // .filter((r) => r.type === 'MESH')
        .map((item) => {
          return <group key={item.name + 'geo'}>{/* <AutoPatch item={item}></AutoPatch> */}</group>
        })}

      {all
        // .filter((r) => r.type === 'MESH')
        .map((item) => {
          return (
            <group key={item.name + 'geo'}>
              <AutoPatch item={item}></AutoPatch>
            </group>
          )
        })}

      {all
        .filter((r) => r.type === 'LIGHT')
        .map((item) => {
          return (
            <group position={item.position} scale={item.scale} quaternion={item.quaternion} key={item.name + 'lights'}>
              <Sphere>
                <meshStandardMaterial wireframe color={item.color}></meshStandardMaterial>
              </Sphere>
              <pointLight color={item.color} intensity={1} power={item.power} />
            </group>
          )
        })}
    </group>
  )
}
