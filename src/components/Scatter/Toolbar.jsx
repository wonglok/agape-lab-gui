import { Environment, OrbitControls, PerspectiveCamera, Stats, View, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { getID, useScatter } from './useScatter'
import { createRef } from 'react'
import { Box3, Object3D } from 'three'
import { Sphere } from 'three'

export function ToolBar() {
  const container = useRef()

  return (
    <>
      <div ref={container} className=' absolute w-full h-full'>
        <Canvas eventSource={container} className='absolute top-0 left-0 z-30 w-full h-full'>
          <LoadScatter></LoadScatter>
          <OutCanvas></OutCanvas>
        </Canvas>

        <Stats></Stats>
        <div className='absolute top-0 left-0 w-full h-full overflow-scroll'>
          {/* <AddStuff></AddStuff> */}
          <OutHtml></OutHtml>
        </div>
      </div>
    </>
  )
}

function OutHtml() {
  let list = useScatter((s) => s.list)
  return (
    <>
      {list.map((r) => {
        return <Html key={r.oid} refTracker={r.ref} oid={r.oid}></Html>
      })}
    </>
  )
}

function OutCanvas() {
  let list = useScatter((s) => s.list)
  return (
    <>
      {list.map((r) => {
        return <R3f key={r.oid} refTracker={r.ref} object={r.object} oid={r.oid}></R3f>
      })}
    </>
  )
}

function R3f({ oid, object, refTracker }) {
  let refCam = useRef()
  let [radius, setRadius] = useState(15)
  let [metaKey, setMetaKey] = useState(false)
  let [center, setCenter] = useState([0, 0, 0])
  //
  let [device, setDevice] = useState('loading')
  useEffect(() => {
    if (!'ontouchstart' in window) {
      setDevice('desktop')
    } else {
      setDevice('mobile')
    }

    let keydown = (e) => {
      setMetaKey(e.metaKey)
    }
    window.addEventListener('keydown', keydown)
    let keyup = (e) => {
      setMetaKey(e.metaKey)
    }
    window.addEventListener('keyup', keyup)
    object.rotation.x = 0.5
    object.updateMatrixWorld(true)

    let box3 = new Box3()
    box3.expandByObject(object)
    let bsp = new Sphere()
    box3.getBoundingSphere(bsp)

    setRadius(bsp.radius * 2.5)

    setCenter(bsp.center.toArray())
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }
  }, [object])

  useFrame((st, dt) => {
    object.rotation.y += dt * 0.4
  }, 1)

  return (
    <View key={oid + 'View'} track={refTracker}>
      <group>{object && <primitive object={object}></primitive>}</group>

      <PerspectiveCamera ref={refCam} makeDefault fov={35} position={[0, center[1], radius]}></PerspectiveCamera>
      {device === 'desktop' && (
        <OrbitControls
          makeDefault
          target={[0, center[1], 0]}
          enableZoom={metaKey}
          enableRotate={true}
          enablePan={false}></OrbitControls>
      )}
      <Environment preset='sunset'></Environment>
    </View>
  )
}

function Html({ oid, refTracker }) {
  return (
    <div key={oid + 'html'} ref={refTracker} className='inline-block' style={{ width: `137px`, height: `137px` }}></div>
  )
}

function LoadScatter() {
  let glb = useGLTF(`/2023/05/07/scatter/party-started-v1.glb`)

  useEffect(() => {
    setTimeout(() => {
      glb.scene.children.forEach((it) => {
        console.log(it.name)
        createOne({ object: it })
      })
    })

    return () => {}
  })
  return <></>
}

let createOne = ({ object }) => {
  let ref = createRef()
  let oid = getID()

  let r = {
    oid,
    ref,
    object,
  }

  useScatter.setState({ list: [...(useScatter.getState().list || []), r] })
}

function AddStuff() {
  return (
    <div className=''>
      {/*  */}

      <button
        onClick={() => {
          createOne({ object: new Object3D() })
        }}>
        Add
      </button>

      {/*  */}
    </div>
  )
}