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
import { eH } from 'mind-ar/dist/controller-495b585f'
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
      const handCount = 2
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
          stick.visible = false
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
            return {
              change: (key, val) => {
                set((st) => {
                  if (st[key] !== val) {
                    onChange({ target: this, key, val })
                    return { ...st, [key]: val }
                  } else {
                    return st
                  }
                })
              },
            }
          })
          this.change = (key, val) => {
            this.useHand.getState().change(key, val)
          }
          this.useHand.subscribe((st, b4) => {
            if (st.show !== b4.show) {
              if (st.show) {
                this.o3d.visible = true
              } else {
                this.o3d.visible = false
              }
            }
            return {
              ...st,
            }
          })

          this.raycaster = new Raycaster()
          this.update = ({ landmarks, worldLandmarks, gestures, handednesses, video }) => {
            stick.visible = false
            if (landmarks?.length > 0) {
              stick.visible = true
            }
            let cam = get().camera
            let target = get().controlsTarget
            let viewport = get().viewport
            let vp = viewport.getCurrentViewport()

            if (cam && target && vp) {
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

                dotMesh.position.lerp(goal.position, 0.45)
                dotMesh.visible = true
              }

              let thumb = this.dots[4].mesh
              let index = this.dots[8].mesh

              if (thumb && index) {
                let distance = thumb.position.distanceTo(index.position)
                if (distance < 0.8) {
                  this.change('pinch', true)
                } else {
                  this.change('pinch', false)
                }
              }

              this.dots[7].mesh.lookAt(this.dots[8].mesh.position)

              this.stick.position.copy(this.dots[7].mesh.position)
              this.stick.quaternion.copy(this.dots[7].mesh.quaternion)
              this.stick.getWorldDirection(this.dots[7].dir)

              this.raycaster.set(this.stick.position, this.dots[7].dir)

              let opt = []
              let scene = get().scene
              let groupCast = scene.getObjectByName('groupCast')
              if (groupCast) {
                opt.push(groupCast)
              }
              let castRes = this.raycaster.intersectObjects(opt, true)

              let hitPt = castRes[0]?.object?.position
              if (hitPt) {
                this.change('hitPt', hitPt)
              } else {
                this.change('hitPt', false)
              }

              if (castRes) {
                this.change('found', castRes)
              } else {
                this.change('found', [])
              }
            }
          }
        }
      }

      let myHands = []
      for (let i = 0; i < handCount; i++) {
        myHands.push(
          new MyHand({
            onChange: ({ target, key, val }) => {
              //
              console.log(key, val)

              //
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

      let plane = new Mesh(
        new PlaneGeometry(1000, 1000, 100, 100),
        new MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 1.0 }),
      )
      plane.name = 'raycast-plane'
      plane.visible = false
    },
  }
})
