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

let stats, gui, conf
const v0 = new THREE.Vector3()

export function IKResolve() {
  let domRef = useRef()
  useEffect(() => {
    domRef.current.innerHTML = ''
    init({ container: domRef.current })
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
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000)
  camera.near = 0.1
  camera.far = 100
  camera.updateProjectionMatrix()

  const ambientLight = new THREE.AmbientLight(0xffffff, 1) // soft white light
  scene.add(ambientLight)

  renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: false })
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

  class CamHand {
    constructor({ side = 'Left', scene, transformControls }) {
      //

      let proxyMesh = new THREE.SkinnedMesh()

      let targetBone = new THREE.Bone()
      targetBone.name = 'target_bone'
      // if (transformControls) {
      //   transformControls.attach(targetBone)
      // }

      this.targetBone = targetBone
      gltf.scene.getObjectByName(`${side}Hand`).getWorldPosition(targetBone.position)

      let bones = [
        //
        // NAMES.Hips,
        NAMES.Spine,
        NAMES.Spine1,
        NAMES.Spine2,
        NAMES[`${side}Shoulder`],
        NAMES[`${side}Arm`],
        NAMES[`${side}ForeArm`],
        NAMES[`${side}Hand`],
        targetBone,
      ]

      let skeleton = new THREE.Skeleton(bones)

      proxyMesh.add(targetBone)
      proxyMesh.bind(skeleton)

      const iks = [
        {
          target: bones.findIndex((r) => r.name === 'target_bone'), // ""
          effector: bones.findIndex((r) => r.name === `${side}Hand`), // ""
          links: [
            {
              index: bones.findIndex((r) => r.name === `${side}ForeArm`), // ""
              // rotationMin: new THREE.Vector3(0, -1.8, 0),
              // rotationMax: new THREE.Vector3(0, 1.8, 0),

              // rotationMin: {
              //   x: Clones[`${side}Shoulder`].rotation.clone().x - 3.14 * 1.5,
              //   y: Clones[`${side}Shoulder`].rotation.clone().y - 3.14 * 1.5,
              //   z: Clones[`${side}Shoulder`].rotation.clone().z - 3.14 * 1.5,
              // },
              // rotationMax: {
              //   x: Clones[`${side}Shoulder`].rotation.clone().x + 3.14 * 1.5,
              //   y: Clones[`${side}Shoulder`].rotation.clone().y + 3.14 * 1.5,
              //   z: Clones[`${side}Shoulder`].rotation.clone().z + 3.14 * 1.5,
              // },
            },
            {
              index: bones.findIndex((r) => r.name === `${side}Arm`), // ""
              // rotationMin: new THREE.Vector3(0, -1.8, 0),
              // rotationMax: new THREE.Vector3(0, 1.8, 0),

              // rotationMin: {
              //   x: Clones[`${side}Shoulder`].rotation.clone().x - 3.14 * 1,
              //   y: Clones[`${side}Shoulder`].rotation.clone().y - 3.14 * 1,
              //   z: Clones[`${side}Shoulder`].rotation.clone().z - 3.14 * 1,
              // },
              // rotationMax: {
              //   x: Clones[`${side}Shoulder`].rotation.clone().x + 3.14 * 1,
              //   y: Clones[`${side}Shoulder`].rotation.clone().y + 3.14 * 1,
              //   z: Clones[`${side}Shoulder`].rotation.clone().z + 3.14 * 1,
              // },
            },
            {
              index: bones.findIndex((r) => r.name === `${side}Shoulder`), // ""
              rotationMin: {
                x: Clones[`${side}Shoulder`].rotation.clone().x - 0.1,
                y: Clones[`${side}Shoulder`].rotation.clone().y - 0.1,
                z: Clones[`${side}Shoulder`].rotation.clone().z - 0.1,
              },
              rotationMax: {
                x: Clones[`${side}Shoulder`].rotation.clone().x + 0.1,
                y: Clones[`${side}Shoulder`].rotation.clone().y + 0.1,
                z: Clones[`${side}Shoulder`].rotation.clone().z + 0.1,
              },
            },
            {
              index: bones.findIndex((r) => r.name === 'Spine2'), // ""
              rotationMin: {
                x: Clones.Spine2.rotation.clone().x - 0.1,
                y: Clones.Spine2.rotation.clone().y - 0.1,
                z: Clones.Spine2.rotation.clone().z - 0.1,
              },
              rotationMax: {
                x: Clones.Spine2.rotation.clone().x + 0.1,
                y: Clones.Spine2.rotation.clone().y + 0.1,
                z: Clones.Spine2.rotation.clone().z + 0.1,
              },
            },
            {
              index: bones.findIndex((r) => r.name === 'Spine1'), // ""
              rotationMin: {
                x: Clones.Spine1.rotation.clone().x - 0.2,
                y: Clones.Spine1.rotation.clone().y - 0.2,
                z: Clones.Spine1.rotation.clone().z - 0.2,
              },
              rotationMax: {
                x: Clones.Spine1.rotation.clone().x + 0.2,
                y: Clones.Spine1.rotation.clone().y + 0.2,
                z: Clones.Spine1.rotation.clone().z + 0.2,
              },
            },
            {
              index: bones.findIndex((r) => r.name === 'Spine'), // ""
              rotationMin: {
                x: Clones.Spine.rotation.clone().x - 0.5,
                y: Clones.Spine.rotation.clone().y - 0.5,
                z: Clones.Spine.rotation.clone().z - 0.5,
              },
              rotationMax: {
                x: Clones.Spine.rotation.clone().x + 0.5,
                y: Clones.Spine.rotation.clone().y + 0.5,
                z: Clones.Spine.rotation.clone().z + 0.5,
              },
            },

            // {
            //   index: bones.findIndex((r) => r.name === 'Hips'), // ""
            //   rotationMin: {
            //     x: Clones.Hips.rotation.clone().x - 0.0,
            //     y: Clones.Hips.rotation.clone().y - 0.0,
            //     z: Clones.Hips.rotation.clone().z - 0.0,
            //   },
            //   rotationMax: {
            //     x: Clones.Hips.rotation.clone().x + 0.0,
            //     y: Clones.Hips.rotation.clone().y + 0.0,
            //     z: Clones.Hips.rotation.clone().z + 0.0,
            //   },
            // },

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

      let myIKSolver = new CCDIKSolver(proxyMesh, iks)
      const ccdikhelper1 = new CCDIKHelper(proxyMesh, iks, 0.015)
      scene.add(ccdikhelper1)

      this.myIKSolver = myIKSolver
      this.update = () => {
        targetBone.updateMatrix()
        targetBone.updateMatrixWorld()
        myIKSolver.update()
      }
    }
  }

  gui = new GUI()
  gui.add(conf, 'followSphere').name('follow sphere')
  gui.add(conf, 'turnHead').name('turn head')
  gui.add(conf, 'ik_solver').name('IK auto update')
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

  let initLeftWP = new THREE.Vector3()
  let initRightWP = new THREE.Vector3()
  gltf.scene.getObjectByName('LeftHand').getWorldPosition(initLeftWP)
  gltf.scene.getObjectByName('RightHand').getWorldPosition(initRightWP)
  let leftHandTP = new THREE.Vector3()
  let rightHandTP = new THREE.Vector3()
  leftHandTP.copy(initLeftWP)
  rightHandTP.copy(initRightWP)

  let anim = async () => {
    let pose = await poseLandmarker.detect(video)

    if (pose.worldLandmarks[0]) {
      leftHandTP.copy({
        x: -pose.worldLandmarks[0][16].x * 1.0 + 0.0 * initRightWP.x,
        y: -pose.worldLandmarks[0][16].y * 1.0 + initRightWP.y,
        z: -pose.worldLandmarks[0][16].z * 1.0 + 0.0 * initRightWP.z,
      })

      rightHandTP.copy({
        x: -pose.worldLandmarks[0][15].x * 1.0 + 0.0 * initLeftWP.x,
        y: -pose.worldLandmarks[0][15].y * 1.0 + initLeftWP.y,
        z: -pose.worldLandmarks[0][15].z * 1.0 + 0.0 * initLeftWP.z,
      })
    }
    video.requestVideoFrameCallback(anim)
  }
  video.onloadeddata = async () => {
    video.requestVideoFrameCallback(anim)
  }

  video.autoplay = true
  video.style.position = 'absolute'
  video.style.left = '0px'
  video.style.top = '0px'
  video.style.width = '128px'
  video.playsInline = true
  video.play()
  container.appendChild(video)

  let leftHand = new CamHand({ side: 'Left', scene })
  let rightHand = new CamHand({ side: 'Right', scene })
  let rAF = () => {
    requestAnimationFrame(rAF)

    scene.traverse(function (object) {
      object.frustumCulled = false
      if (object.isSkinnedMesh) object.geometry.computeBoundingSphere()
    })

    leftHand.targetBone.position.lerp(leftHandTP, 0.07)
    leftHand.update()

    rightHand.targetBone.position.lerp(rightHandTP, 0.07)
    rightHand.update()

    orbitControls.update()
    renderer.render(scene, camera)

    stats.update() // fps stats
  }
  requestAnimationFrame(rAF)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}
