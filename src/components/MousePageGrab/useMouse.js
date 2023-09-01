import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import {
  Color,
  CubicBezierCurve3,
  DoubleSide,
  IcosahedronGeometry,
  MathUtils,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Ray,
} from 'three'
import { BoxGeometry } from 'three'
import { CubicBezierCurve, TubeGeometry } from 'three'
import {
  EquirectangularReflectionMapping,
  ExtrudeGeometry,
  Mesh,
  Object3D,
  PlaneGeometry,
  Raycaster,
  Vector3,
  VideoTexture,
  sRGBEncoding,
} from 'three'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { create } from 'zustand'
import { useMouseCache } from './useMouseCache'
// import { Mini } from './Noodle/Mini'
// import { CursorTrackerTail } from './Noodle/CursorTrackerTail'

//
export const useMouse = create((set, get) => {
  return {
    cursor: null,
    stick: null,
    bloomLights: [],
    bloomMeshes: [],
    handID: false,

    //
    collider: useMouseCache.get('collider') || false,
    handResult: false,
    bones: [],
    scene: false,
    camera: false,
    picking: false,
    activeObjects: [],
    activeUUID: false,
    viewport: false,
    loading: false,
    showStartMenu: true,
    video: false,
    videoTexture: false,
    cleanMini: () => {},
    onLoop: () => {},
    cancel: () => {},
    cleanVideoTexture: () => {},
    runProcessVideoFrame: () => {},
    initVideo: () => {
      set({ inited: true })
      set({ loading: true })
      let video = document.createElement('video')
      video.playsInline = true

      let stream = navigator.mediaDevices.getUserMedia({
        video: {
          width: 256,
          height: 256,
        },
        audio: false,
      })

      stream.then((r) => {
        video.srcObject = r
        video.onloadeddata = () => {
          let videoTexture = new VideoTexture(video)
          videoTexture.encoding = sRGBEncoding
          videoTexture.mapping = EquirectangularReflectionMapping
          let id = 0
          let canRun = true
          let func = () => {
            if (canRun) {
              id = video.requestVideoFrameCallback(func)
            }
            videoTexture.needsUpdate = true
            get().runProcessVideoFrame({ video })
          }
          id = video.requestVideoFrameCallback(func)
          get().cancel()
          set({
            cancel: () => {
              let recogizer = get().recogizer
              if (recogizer?.close) {
                recogizer.close()
              }
              canRun = false
            },
            vid: id,
            videoTexture: videoTexture,
            video: video,
          })
          set({ loading: false, showStartMenu: false })
        }
        video.play()
      })
    },
    initTask: async () => {
      const handCount = 1
      // Create task for image file processing:
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        '/gesture-vision_wasm-v-0.10.4',
      )
      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/gesture-vision_wasm-v-0.10.4/gesture_recognizer.task',
          delegate: 'GPU',
        },
        numHands: handCount,
        runningMode: 'VIDEO',
      })

      setTimeout(() => {
        handLandmarker.setOptions({ baseOptions: { delegate: 'GPU' }, numHands: handCount, runningMode: 'VIDEO' })
        console.log('set to gpu')
      }, 100)

      set({ recogizer: gestureRecognizer })

      let handLandmarker = gestureRecognizer

      class MyHand {
        constructor({ onChange = (v) => console.log(v) }) {
          this.scan = new Object3D()
          this.o3d = new Object3D()

          let stick = new Mesh(new BoxGeometry(0.01, 0.01, 8), new MeshBasicMaterial({ color: 0xffff00 }))
          this.stick = stick
          this.o3d.add(stick)
          stick.geometry.translate(0, 0, 8 / 2)
          stick.direction = new Vector3()

          let crystal = new MeshPhysicalMaterial({ color: '#0000ff', metalness: 1, roughness: 0 })
          this.dots = []
          for (let i = 0; i < 20; i++) {
            let mesh = new Mesh(new IcosahedronGeometry(0.1, 1), crystal)
            this.dots.push({
              mesh,
              dir: new Vector3(),
            })
            this.o3d.add(mesh)
          }

          let goal = new Object3D()

          this.useHand = create((set, get) => {
            return {}
          })

          let target = this
          let getH = this.useHand.getState
          let setH = this.useHand.setState
          this.change = (key, val) => {
            setH((s) => {
              if (s[key] === val) {
                return { ...s }
              }

              let beforeState = { ...s }
              let afterState = { ...s, [key]: val }
              onChange({
                //
                target: target,

                //
                key,

                val: val,
                before: s[key],

                //
                afterState,
                beforeState,
              })
              return afterState
            })
          }

          this.raycaster = new Raycaster()
          this.update = ({ landmarks, worldLandmarks, gestures, handednesses, video }) => {
            let viewport = get().viewport
            let vp = viewport.getCurrentViewport()

            if (vp) {
              let lmk = landmarks[0]
              let vpx = (lmk.x * 2.0 - 1.0) * vp.width
              let vpy = (lmk.y * 2.0 - 1.0) * vp.height
              let vpz = lmk.z

              for (let bone = 0; bone < 20; bone++) {
                let dotMesh = this.dots[bone].mesh
                let wmk = worldLandmarks[bone]

                goal.position.set(-wmk.x, -wmk.y, wmk.z).multiplyScalar(20)
                goal.position.x += -vpx
                goal.position.y += -vpy + 2.5
                goal.position.z += -vpz

                dotMesh.position.lerp(goal.position, 0.15)
                dotMesh.visible = true
              }

              {
                this.stick.position.copy(this.dots[9].mesh.position)
                this.stick.lookAt(
                  //!SECTION
                  this.dots[9].mesh.position.x,
                  this.dots[9].mesh.position.y,
                  this.dots[9].mesh.position.z - 5,
                )

                this.stick.getWorldDirection(this.dots[9].dir)
                this.raycaster.set(this.dots[9].mesh.position, this.dots[9].dir)

                let opt = []
                let scene = get().scene
                let groupCast = scene.getObjectByName('groupCast')
                if (groupCast) {
                  opt.push(groupCast)
                }
                let castRes = this.raycaster.intersectObjects(opt, true)

                if (castRes && castRes[0]) {
                  this.change('found', [castRes[0]])
                } else {
                  this.change('found', [])
                }
              }

              {
                let isGrabbing = gestures[0]?.categoryName === 'Closed_Fist'
                let isOpenPalm = gestures[0]?.categoryName === 'Open_Palm'

                if (isGrabbing === true) {
                  this.change('pinch', true)
                }
                if (isOpenPalm === true) {
                  this.change('pinch', false)
                }
              }

              {
                let result = this.raycaster.intersectObject(dragPlane, false)
                if (result[0]?.point) {
                  if (this.useHand.getState().move) {
                    this.change('delta', result[0]?.point.clone().sub(this.useHand.getState().move))
                  }
                  this.change('move', result[0]?.point.clone())
                }
              }

              //
            }
          }
        }
      }

      let list = []
      let myHands = []
      let isPinching = false
      for (let i = 0; i < handCount; i++) {
        myHands.push(
          new MyHand({
            onChange: ({ key, val, before, beforeState, afterState }) => {
              if (key === 'found') {
                if (before?.length > 0) {
                  before.forEach((it) => {
                    it.object.material.emissive = new Color('#000000')
                  })
                }
                if (val?.length > 0) {
                  val.forEach((it) => {
                    it.object.material.emissive = new Color('#ff0000')
                  })
                }
              }

              if (key === 'pinch') {
                console.log(key, val)
                isPinching = val
                list = beforeState['found']
              }

              if (key === 'delta') {
                console.log(val)
                if (isPinching) {
                  list.forEach((it) => {
                    it.object.position.add(val)
                  })
                }
              }
            },
          }),
        )
      }

      set({
        handsInsert: myHands.map((h) => {
          return <primitive key={h.o3d.uuid} object={h.o3d}></primitive>
        }),
        runProcessVideoFrame: ({ video }) => {
          if (video) {
            let nowInMs = Date.now()
            let result = handLandmarker.recognizeForVideo(video, nowInMs, {
              rotationDegrees: 0,
            })

            set({ handResult: result })

            myHands.forEach((eHand, idx) => {
              if (result.landmarks[idx]) {
                eHand.change('show', true)
                eHand.update({
                  video,
                  gestures: result.gestures[idx],
                  landmarks: result.landmarks[idx],
                  worldLandmarks: result.worldLandmarks[idx],
                })
              } else {
                eHand.change('show', false)
              }
            })
          }
        },
      })

      //

      let dragPlane = new Mesh(
        new PlaneGeometry(1000, 1000, 100, 100),
        new MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 1.0 }),
      )
      dragPlane.visible = false
      dragPlane.position.z = -10
      get().camera.add(dragPlane)
      get().scene.add(get().camera)
    },
  }
})
