import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { CCDIKSolver, CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { useEffect, useRef } from 'react'
// import { Object3D } from 'three147'

let scene, camera, renderer, orbitControls, transformControls
let mirrorSphereCamera

const OOI = {}
let IKSolver

let stats, gui, conf
const v0 = new THREE.Vector3()

export function IKResolve() {
  let domRef = useRef()
  useEffect(() => {
    domRef.current.innerHTML = ''
    init({ container: domRef.current }).then(animate)
  }, [])

  return (
    <>
      <div ref={domRef}></div>
    </>
  )
}
async function init({ container }) {
  conf = {
    followSphere: false,
    turnHead: false,
    ik_solver: true,
    update: updateIK,
  }

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xffffff, 0.17)
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000)
  camera.near = 0.1
  camera.far = 100
  camera.updateProjectionMatrix()

  const ambientLight = new THREE.AmbientLight(0xffffff, 1) // soft white light
  scene.add(ambientLight)

  renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.useLegacyLights = true
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  stats = new Stats()
  container.appendChild(stats.dom)

  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.target.set(0, 1.5, 0)
  camera.position.set(0, 1.5, 2)

  orbitControls.enableDamping = true

  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco-2023-08/')
  const gltfLoader = new GLTFLoader()
  gltfLoader.setDRACOLoader(dracoLoader)

  const gltf = await gltfLoader.loadAsync('/rpm/avatar/default-lok.glb')
  let NAMES = {}
  let Clones = {}
  gltf.scene.traverse((n) => {
    console.log(n.name)
    NAMES[n.name] = n
    Clones[n.name] = n.clone()
  })

  scene.add(gltf.scene)

  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.size = 0.75
  transformControls.space = 'world'
  scene.add(transformControls)

  // disable orbitControls while using transformControls
  transformControls.addEventListener('mouseDown', () => (orbitControls.enabled = false))
  transformControls.addEventListener('mouseUp', () => (orbitControls.enabled = true))

  let proxyMesh = new THREE.SkinnedMesh()

  let targetBone = new THREE.Bone()
  targetBone.name = 'target_bone'
  transformControls.attach(targetBone)

  gltf.scene.getObjectByName('LeftHand').getWorldPosition(targetBone.position)

  let bones = [
    //
    // NAMES.Hips,
    // NAMES.Spine,
    NAMES.Spine1,
    NAMES.Spine2,
    NAMES.LeftShoulder,
    NAMES.LeftArm,
    NAMES.LeftForeArm,
    NAMES.LeftHand,
    targetBone,
  ]

  let skeleton = new THREE.Skeleton(bones)

  proxyMesh.add(targetBone)
  proxyMesh.bind(skeleton)

  const iks = [
    {
      target: bones.findIndex((r) => r.name === 'target_bone'), // ""
      effector: bones.findIndex((r) => r.name === 'LeftHand'), // ""
      links: [
        {
          index: bones.findIndex((r) => r.name === 'LeftForeArm'), // ""
          // rotationMin: new THREE.Vector3(0, -1.8, 0),
          // rotationMax: new THREE.Vector3(0, 1.8, 0),
        },
        {
          index: bones.findIndex((r) => r.name === 'LeftArm'), // ""
          // rotationMin: new THREE.Vector3(0, -1.8, 0),
          // rotationMax: new THREE.Vector3(0, 1.8, 0),
        },
        {
          index: bones.findIndex((r) => r.name === 'LeftShoulder'), // ""
          rotationMin: Clones.LeftShoulder.rotation.clone(),
          rotationMax: Clones.LeftShoulder.rotation.clone(),
        },
        {
          index: bones.findIndex((r) => r.name === 'Spine2'), // ""
          rotationMin: Clones.Spine2.rotation.clone(),
          rotationMax: Clones.Spine2.rotation.clone(),
        },
        {
          index: bones.findIndex((r) => r.name === 'Spine1'), // ""
          rotationMin: Clones.Spine1.rotation.clone(),
          rotationMax: Clones.Spine1.rotation.clone(),
        },
        //   {
        //     index: 2, // "Spine1"
        //     rotationMin: new THREE.Vector3(0, -1.8, 0),
        //     rotationMax: new THREE.Vector3(0, 1.8, 0),
        //   },
        //   {
        //     index: 1, // "Spine"
        //     rotationMin: new THREE.Vector3(0, -1.8, 0),
        //     rotationMax: new THREE.Vector3(0, 1.8, 0),
        //   },
        //   {
        //     index: 0, // "Hips"
        //     rotationMin: new THREE.Vector3(0, -1.8, 0),
        //     rotationMax: new THREE.Vector3(0, 1.8, 0),
        //     // rotationMin: new THREE.Vector3(1.2, -1.8, -0.4),
        //     // rotationMax: new THREE.Vector3(1.7, -1.1, 0.3),
        //   },
      ],
    },
  ]

  IKSolver = new CCDIKSolver(proxyMesh, iks)
  const ccdikhelper = new CCDIKHelper(proxyMesh, iks, 0.02)
  scene.add(ccdikhelper)

  gui = new GUI()
  gui.add(conf, 'followSphere').name('follow sphere')
  gui.add(conf, 'turnHead').name('turn head')
  gui.add(conf, 'ik_solver').name('IK auto update')
  gui.add(conf, 'update').name('IK manual update()')
  gui.open()

  window.addEventListener('resize', onWindowResize, false)

  let createPose = async () => {
    let { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.4/wasm',
    )
    let poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numPoses: 1,
    })

    return poseLandmarker
  }

  let poseLandmarker = await createPose()

  let video = document.createElement('video')

  let stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 512,
      height: 512,
    },
  })
  video.srcObject = stream

  let wp = new THREE.Vector3()
  gltf.scene.getObjectByName('LeftHand').getWorldPosition(wp)
  let tp = new THREE.Vector3()
  tp.copy(wp)
  let rAF = () => {
    targetBone.position.lerp(tp, 0.1)
    requestAnimationFrame(rAF)
  }
  requestAnimationFrame(rAF)
  let anim = async () => {
    let pose = await poseLandmarker.detect(video)

    if (pose.worldLandmarks[0]) {
      // console.log(pose.worldLandmarks[0][15])

      tp.copy({
        x: -pose.worldLandmarks[0][16].x + wp.x,
        y: -pose.worldLandmarks[0][16].y + wp.y,
        z: -pose.worldLandmarks[0][16].z + wp.z,
      })
    }
    video.requestVideoFrameCallback(anim)
  }
  video.onplaying = async () => {
    video.requestVideoFrameCallback(anim)
  }
  video.autoplay = true
  video.style.position = 'absolute'
  video.style.left = '0px'
  video.style.top = '0px'
  video.style.width = '128px'
  video.playsInline = true
  container.appendChild(video)
}

function animate() {
  if (conf.ik_solver) {
    updateIK()
  }

  orbitControls.update()
  renderer.render(scene, camera)

  stats.update() // fps stats

  requestAnimationFrame(animate)
}

function updateIK() {
  if (IKSolver) IKSolver.update()

  scene.traverse(function (object) {
    object.frustumCulled = false
    if (object.isSkinnedMesh) object.geometry.computeBoundingSphere()
  })
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}
