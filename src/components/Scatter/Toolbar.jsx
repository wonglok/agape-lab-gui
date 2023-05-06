import {
  Backdrop,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Preload,
  Stage,
  Stats,
  View,
  useGLTF,
} from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { getID, useScatter } from './useScatter'
import { createRef } from 'react'
import { Box3, Object3D } from 'three'
import { Sphere } from 'three'
import { Spherical } from 'three'

//
export function ToolBar() {
  const container = useRef()

  return (
    <>
      <div ref={container} className='w-full h-full'>
        <Canvas eventSource={container} className='absolute top-0 left-0 z-30 w-full h-full'>
          <OutCanvas></OutCanvas>
          <LoadScatter></LoadScatter>
        </Canvas>

        <Stats></Stats>
        <div className=' absolute top-0 left-0 w-full h-full overflow-scroll'>
          <AddStuff></AddStuff>

          <div>
            <OutHtml></OutHtml>
          </div>
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
  useEffect(() => {
    let keydown = (e) => {
      setMetaKey(e.metaKey)
    }
    window.addEventListener('keydown', keydown)
    let keyup = (e) => {
      setMetaKey(e.metaKey)
    }
    window.addEventListener('keyup', keyup)

    let box3 = new Box3()
    box3.expandByObject(object)
    let bsp = new Sphere()
    box3.getBoundingSphere(bsp)

    setRadius(bsp.radius * 2.3)

    setCenter(bsp.center.toArray())
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
    }
  }, [object])

  return (
    <View key={oid + 'View'} track={refTracker}>
      <group>{object && <primitive object={object}></primitive>}</group>

      <PerspectiveCamera ref={refCam} makeDefault position={[2, 2, radius]}></PerspectiveCamera>
      <OrbitControls makeDefault target={center} enableZoom={metaKey} enablePan={false}></OrbitControls>
      <Environment preset='sunset'></Environment>
    </View>
  )
}

function Html({ oid, refTracker }) {
  return (
    <div key={oid + 'html'} ref={refTracker} className='inline-block' style={{ width: `200px`, height: `200px` }}></div>
  )
}

function LoadScatter() {
  let glb = useGLTF(`/2023/05/07/scatter/party-started-v1.glb`)

  useEffect(() => {
    useScatter.setState({ list: [] })
    glb.scene.children.forEach((it) => {
      createOne({ object: it })
    })
  }, [glb])
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
