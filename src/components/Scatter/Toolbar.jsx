import { Environment, PerspectiveCamera, View } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { getID, useScatter } from './useScatter'

function Item({ data, setArray }) {
  let tracking = useRef()

  useEffect(() => {
    setArray((s) => {
      return [
        ...s,
        {
          oid: data.oid,
          html: (
            <div key={data.oid} ref={tracking} className='inline-block' style={{ width: `100px`, height: `100px` }}>
              Box
            </div>
          ),
          r3f: (
            <View key={data.oid + 'view'} track={tracking}>
              <color attach='background' args={['#ff0000']} />

              <ambientLight intensity={0.5} />

              <pointLight position={[20, 30, 10]} intensity={1} />

              <Environment preset='dawn' />

              <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />

              <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color={'#ff0000'} />
              </mesh>

              {/*  */}
            </View>
          ),
        },
      ]
    })

    return () => {
      setArray((s) => {
        return s.filter((f) => f.oid !== data.oid)
      })
    }
  }, [data.oid, setArray, tracking])

  return <></>
}

export function ToolBar() {
  const container = useRef()
  const [arr, setArray] = useState([])
  return (
    <>
      <div ref={container} className='absolute bottom-0 left-0 w-full border-t border-gray-500 shadow-xl h-60'>
        <Canvas eventSource={container} className=' absolute top-0 left-0 w-full h-full'>
          <Repeat setArray={setArray}></Repeat>

          {arr.map((r) => {
            return r.r3f
          })}
        </Canvas>
        <div className=' absolute top-0 left-0 w-full h-full'>
          {arr.map((r) => {
            return r.html
          })}
          <AddStuff></AddStuff>
        </div>
      </div>
    </>
  )
}

function AddStuff() {
  return (
    <div className=''>
      {/*  */}

      <button
        onClick={() => {
          let item = {
            oid: getID(),
          }

          useScatter.setState({ items: [...useScatter.getState().items, item] })
        }}>
        Add
      </button>

      {/*  */}
    </div>
  )
}

function Repeat({ setArray }) {
  let list = useScatter((r) => r.items)
  return (
    <>
      {list.map((li) => (
        <Item data={li} setArray={setArray} key={li.oid}>
          {/*  */}
        </Item>
      ))}
    </>
  )
}
