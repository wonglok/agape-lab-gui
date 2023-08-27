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

  // transformControls = new TransformControls(camera, renderer.domElement)
  // transformControls.size = 0.75
  // transformControls.space = 'world'
  // scene.add(transformControls)

  // // disable orbitControls while using transformControls
  // transformControls.addEventListener('mouseDown', () => (orbitControls.enabled = false))
  // transformControls.addEventListener('mouseUp', () => (orbitControls.enabled = true))

  class CamHand {
    constructor({ side = 'Left', scene }) {
      //

      let proxyMesh = new THREE.SkinnedMesh()

      let targetHandBone = new THREE.Bone()
      targetHandBone.name = `${side}HandTarget`
      this.targetHandBone = targetHandBone
      gltf.scene.getObjectByName(`${side}Hand`).getWorldPosition(targetHandBone.position)

      let targetForeArmBone = new THREE.Bone()
      targetForeArmBone.name = `${side}ForeArmTarget`
      this.targetForeArmBone = targetForeArmBone
      gltf.scene.getObjectByName(`${side}ForeArm`).getWorldPosition(targetForeArmBone.position)

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
        targetHandBone,
        targetForeArmBone,
      ]

      let skeleton = new THREE.Skeleton(bones)

      proxyMesh.add(targetHandBone)
      proxyMesh.add(targetForeArmBone)
      proxyMesh.bind(skeleton)

      this.worldTargetHand = targetHandBone.position.clone()
      this.worldTargetForeArm = targetForeArmBone.position.clone()

      const iks = [
        {
          target: bones.findIndex((r) => r.name === `${side}HandTarget`), // ""
          effector: bones.findIndex((r) => r.name === `${side}Hand`), // ""
          links: [
            {
              index: bones.findIndex((r) => r.name === `${side}ForeArm`), // ""
              rotationMin: {
                x: Clones[`${side}ForeArm`].rotation.clone().x - 3.14 * 0.2222,
                y: Clones[`${side}ForeArm`].rotation.clone().y - 3.14 * 0.1,
                z: Clones[`${side}ForeArm`].rotation.clone().z - 3.14 * 0.2222,
              },
              rotationMax: {
                x: Clones[`${side}ForeArm`].rotation.clone().x + 3.14 * 0.2222,
                y: Clones[`${side}ForeArm`].rotation.clone().y + 3.14 * 0.1,
                z: Clones[`${side}ForeArm`].rotation.clone().z + 3.14 * 0.2222,
              },
            },
            {
              index: bones.findIndex((r) => r.name === `${side}Arm`), // ""
              rotationMin: {
                x: Clones[`${side}Arm`].rotation.clone().x - 3.14 * 0.2222,
                y: Clones[`${side}Arm`].rotation.clone().y - 3.14 * 0.1,
                z: Clones[`${side}Arm`].rotation.clone().z - 3.14 * 0.2222,
              },
              rotationMax: {
                x: Clones[`${side}Arm`].rotation.clone().x + 3.14 * 0.2222,
                y: Clones[`${side}Arm`].rotation.clone().y + 3.14 * 0.1,
                z: Clones[`${side}Arm`].rotation.clone().z + 3.14 * 0.2222,
              },
            },
            {
              index: bones.findIndex((r) => r.name === `${side}Shoulder`), // ""
              rotationMin: {
                x: Clones[`${side}Shoulder`].rotation.clone().x - 3.14 * 0.1,
                y: Clones[`${side}Shoulder`].rotation.clone().y - 3.14 * 0.1,
                z: Clones[`${side}Shoulder`].rotation.clone().z - 3.14 * 0.1,
              },
              rotationMax: {
                x: Clones[`${side}Shoulder`].rotation.clone().x + 3.14 * 0.1,
                y: Clones[`${side}Shoulder`].rotation.clone().y + 3.14 * 0.1,
                z: Clones[`${side}Shoulder`].rotation.clone().z + 3.14 * 0.1,
              },
            },
            {
              index: bones.findIndex((r) => r.name === 'Spine2'), // ""
              rotationMin: {
                x: Clones.Spine2.rotation.clone().x - 0.1,
                y: Clones.Spine2.rotation.clone().y - 0.5,
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
                x: Clones.Spine1.rotation.clone().x - 0.05,
                y: Clones.Spine1.rotation.clone().y - 0.05,
                z: Clones.Spine1.rotation.clone().z - 0.05,
              },
              rotationMax: {
                x: Clones.Spine1.rotation.clone().x + 0.05,
                y: Clones.Spine1.rotation.clone().y + 0.05,
                z: Clones.Spine1.rotation.clone().z + 0.05,
              },
            },
            {
              index: bones.findIndex((r) => r.name === 'Spine'), // ""
              rotationMin: {
                x: Clones.Spine.rotation.clone().x - 0.05,
                y: Clones.Spine.rotation.clone().y - 0.05,
                z: Clones.Spine.rotation.clone().z - 0.05,
              },
              rotationMax: {
                x: Clones.Spine.rotation.clone().x + 0.05,
                y: Clones.Spine.rotation.clone().y + 0.05,
                z: Clones.Spine.rotation.clone().z + 0.05,
              },
            },
          ],
        },
      ]

      let myIKSolver = new CCDIKSolver(proxyMesh, iks)
      const ccdikhelper1 = new CCDIKHelper(proxyMesh, iks, 0.015)
      scene.add(ccdikhelper1)

      this.myIKSolver = myIKSolver
      this.update = () => {
        // targetForeArmBone.position.lerp(this.worldTargetForeArm, 0.075)
        // targetForeArmBone.updateMatrix()
        // targetForeArmBone.updateMatrixWorld()

        targetHandBone.position.lerp(this.worldTargetHand, 0.075)
        targetHandBone.updateMatrix()
        targetHandBone.updateMatrixWorld()

        //
        myIKSolver.update()
      }
    }
  }

  // gui = new GUI()
  // gui.add(conf, 'followSphere').name('follow sphere')
  // gui.add(conf, 'turnHead').name('turn head')
  // gui.add(conf, 'ik_solver').name('IK auto update')
  // gui.open()

  window.addEventListener('resize', onWindowResize, false)

  let createPose = async () => {
    let { PoseLandmarker, FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.4/wasm',
    )

    let poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    })

    const filesetResolver = await FilesetResolver.forVisionTasks(
      `/FaceAvatar/task-vision-wasm`,
      // 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
    )
    const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        modelAssetPath: `/FaceAvatar/face-landmark/face_landmarker.task`,
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFacialTransformationMatrixes: true,
    })

    return { poseLandmarker, faceLandmarker }
  }

  let { poseLandmarker, faceLandmarker } = await createPose()

  let video = document.createElement('video')

  let stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 256,
      height: 256,
    },
  })
  video.srcObject = stream

  let initLeftWP = new THREE.Vector3()
  gltf.scene.getObjectByName('LeftHand').getWorldPosition(initLeftWP)

  let initRightWP = new THREE.Vector3()
  gltf.scene.getObjectByName('RightHand').getWorldPosition(initRightWP)

  let initLeftForeArmWP = new THREE.Vector3()
  gltf.scene.getObjectByName('LeftForeArm').getWorldPosition(initLeftForeArmWP)

  let initRightForeArmWP = new THREE.Vector3()
  gltf.scene.getObjectByName('RightForeArm').getWorldPosition(initRightForeArmWP)

  let leftHandTP = new THREE.Vector3()
  let rightHandTP = new THREE.Vector3()
  leftHandTP.copy(initLeftWP)
  rightHandTP.copy(initRightWP)

  let m4 = new THREE.Matrix4()
  let o3d = new THREE.Object3D()

  let anim = async () => {
    video.requestVideoFrameCallback(anim)

    // center.copy(leftHand.worldTargetHand).add(rightHand.worldTargetHand).multiplyScalar(0.5)
    // center.z += 1
    // center.y += 0.5
    // smoothCenter.lerp(center, 0.1)
    NAMES.Head.lookAt(camera.position)

    let ts = performance.now()

    let results = await faceLandmarker.detectForVideo(video, ts)
    let faceBlendshapes = results.faceBlendshapes
    let faceMatrix = results.facialTransformationMatrixes

    let fristMatrix = faceMatrix[0]
    let firstFace = faceBlendshapes[0]
    if (firstFace && fristMatrix) {
      m4.fromArray(fristMatrix.data)
      m4.decompose(o3d.position, o3d.quaternion, o3d.scale)

      // setData({
      //   morphTargets: firstFace.categories,
      //   o3d: o3d,
      // })

      let morphTargets = firstFace.categories

      gltf.scene.traverse((r) => {
        if (r && r.geometry && r.morphTargetDictionary && r.morphTargetInfluences) {
          // morphTargets.find((r) => r.categoryName === 'mouthFunnel').score
          // mouthSmileLeft
          // console.log(r.morphTargetDictionary)

          for (let kn in r.morphTargetDictionary) {
            let foundTarget = morphTargets.find((r) => r.categoryName === kn)
            if (foundTarget) {
              let fromVal = r.morphTargetInfluences[r.morphTargetDictionary[kn]]
              let toVal = foundTarget.score

              r.morphTargetInfluences[r.morphTargetDictionary[kn]] = THREE.MathUtils.lerp(fromVal, toVal, 0.9)

              // MathUtils.damp(
              //   fromVal,
              //   toVal,
              //   1 * 150,
              //   dt,
              // )
            }
          }

          //r.morphTargetDictionary

          // let foundTarget = morphTargets.find((r) => r.categoryName === 'jawOpen')
          // if (foundTarget) {
          //   r.morphTargetInfluences[r.morphTargetDictionary['jawOpen']] = foundTarget.score
          // }
        }
      })
    }

    ts = performance.now()
    let pose = await poseLandmarker.detectForVideo(video, ts)

    if (pose.worldLandmarks[0]) {
      leftHand.worldTargetHand.copy({
        x: -pose.worldLandmarks[0][16].x * 1.0 + 0.0 * initLeftWP.x,
        y: -pose.worldLandmarks[0][16].y * 1.0 + 1.0 * initLeftWP.y,
        z: -pose.worldLandmarks[0][16].z * 1.0 + 1.0 * initLeftWP.z,
      })

      rightHand.worldTargetHand.copy({
        x: -pose.worldLandmarks[0][15].x * 1.0 + 0.0 * initRightWP.x,
        y: -pose.worldLandmarks[0][15].y * 1.0 + 1.0 * initRightWP.y,
        z: -pose.worldLandmarks[0][15].z * 1.0 + 1.0 * initRightWP.z,
      })
    }
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

    orbitControls.update()
    renderer.render(scene, camera)
    stats.update()

    leftHand.update()
    rightHand.update()
  }
  requestAnimationFrame(rAF)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}
