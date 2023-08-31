import { FilesetResolver, GestureRecognizer, HandLandmarker } from '@mediapipe/tasks-vision'
import { Color, CubicBezierCurve3, DoubleSide, MathUtils, MeshBasicMaterial, Ray } from 'three'
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
import { Mini } from './Noodle/Mini'
import { CursorTrackerTail } from './Noodle/CursorTrackerTail'

//
export const useMouse = create((set, get) => {
  return {
    cursor: null,
    stick: null,
    bloomLights: [],
    bloomMeshes: [],
    handID: false,
    //
    collider: false,
    handResult: false,
    hands: [],
    scene: false,
    camera: false,
    picking: [],
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
      // let width = window.innerWidth
      // let height = window.innerHeight
      // if (width >= height) {
      //   video.width = 512
      //   video.height = 512 * (height / width)
      // }
      // if (width < height) {
      //   video.width = 512 * (width / height)
      //   video.height = 512
      // }

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
      let array = []
      let eachHandPointCount = 21
      let dotCount = handCount * eachHandPointCount // plus 1 for palm
      for (let i = 0; i < dotCount; i++) {
        array.push(new Object3D())
      }
      array.map((r) => {
        r.visible = true
        return r
      })

      let stick = new Mesh(new BoxGeometry(0.02, 0.02, 8), new MeshBasicMaterial({ color: 0xff00ff }))
      stick.geometry.translate(0, 0, 8 / 2)
      stick.visible = false
      stick.direction = new Vector3()
      set({ stick: <primitive object={stick}></primitive> })

      let raycaster = new Raycaster()
      let dir = new Vector3()
      let plane = new Mesh(
        new PlaneGeometry(1000, 1000, 100, 100),
        new MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 1.0 }),
      )
      plane.name = 'raycast-plane'
      plane.visible = false

      set({ hoverPlane: <primitive object={plane}></primitive> })
      let targetGoal = new Vector3()

      let cursor = new Object3D()
      set({ cursor: <primitive object={cursor}></primitive> })

      // let o3 = new Object3D()

      // set({ ribbons: <primitive object={o3}></primitive> })

      // let tail = new CursorTrackerTail({
      //   gl: get().gl,
      //   mini: new Mini({}),
      //   camera: get().camera,
      //   mounter: o3,
      //   cursor: cursor,
      //   color: new Color('#ffffff'),
      //   onInsert: (v) => {
      //     // set({
      //     //   bloomMeshes: [v],
      //     // })
      //   },
      // })

      // set({
      //   cleanMini: () => {
      //     tail.mini.clean()
      //   },
      // })

      //
      // let ray = new Ray()
      set({
        onLoop: (st, dt) => {
          // {
          //   // tail.mini.work(st, dt)
          //   let collider = get().collider
          //   let geometry = collider?.geometry
          //   let boundsTree = geometry?.boundsTree

          //   let handIndex = 0
          //   let beforeTip = array[handIndex * eachHandPointCount + 6]
          //   let indexTip = array[handIndex * eachHandPointCount + 8]
          //   beforeTip.lookAt(indexTip.position)
          //   beforeTip.getWorldDirection(dir)

          //   ray.set(beforeTip.position, dir)

          //   let res = boundsTree.raycastFirst(ray, DoubleSide)

          //   let activeObjects = get().activeObjects
          //   let picking = get().picking

          //   let mouse = get().mouse

          //   if (picking && picking.length > 0) {
          //     picking[0].getWorldPosition(cursor.position)
          //   } else if (activeObjects && activeObjects.length > 0) {
          //     cursor.position.lerp(activeObjects[0].userData.raycastPoint, 1)
          //   } else if (res) {
          //     cursor.position.lerp(res.point, 1)
          //   }
          // }
          // console.log(cursor.position)

          //
          {
            {
              let casterGroup = get().scene.getObjectByName('raycast-group')
              casterGroup.traverse((ob) => {
                if (ob.material) {
                  ob.material.emissive = new Color('#000000')
                }
              })
            }

            {
              get().activeObjects?.forEach((picked) => {
                if (picked) {
                  picked.traverse((ob) => {
                    if (ob.material) {
                      ob.material.emissive = new Color('#ffffff')
                    }
                  })
                }
              })
            }

            let picking = get()?.picking || []
            picking.forEach((picked) => {
              if (picked) {
                if (picked) {
                  picked.traverse((ob) => {
                    if (ob.material) {
                      ob.material.emissive = new Color('#ffffff')
                    }
                  })
                }

                picked.traverseAncestors((it) => {
                  if (it?.userData?.dragGroup) {
                    stick.getWorldDirection(stick.direction)
                    raycaster.set(stick.position, stick.direction)

                    let results = raycaster.intersectObject(plane)
                    let result = results[0]

                    if (it && result) {
                      targetGoal.set(result.point.x, result.point.y, it.position.z)
                      it.position.lerp(targetGoal, 0.25)
                    }
                  }
                })
              }
            })
          }

          // {
          //
          //   let res = raycaster.intersectObject(casterGroup, true)
          //   get().activeObjects?.forEach((it) => {
          //     if (it) {
          //       let ancestor = it
          //       it.traverseAncestors((an) => {
          //         if (an?.userData?.dragGroup) {
          //           ancestor = an
          //         }
          //       })

          //       ancestor.traverse((ob) => {
          //         if (ob.material) {
          //           ob.material.emissive = new Color('#000000')
          //         }
          //       })
          //     }
          //   })
          //   if (res) {
          //     res.map((r) => {
          //       let it = r.object
          //       let ancestor = it
          //       it.traverseAncestors((an) => {
          //         if (an?.userData?.dragGroup) {
          //           ancestor = an
          //         }
          //       })
          //       ancestor.traverse((ob) => {
          //         if (ob.material) {
          //           ob.material.emissive = new Color('#ffffff')
          //         }
          //       })
          //     })
          //   }
          // }
        },
      })

      let goal = new Object3D()

      let midOfAB2C = new Object3D()
      let midOfCD2E = new Object3D()

      let b4midOfAB2C = new Object3D()
      let b4midOfCD2E = new Object3D()

      set({
        hands: array,
        runProcessVideoFrame: ({ video }) => {
          //
          if (video) {
            let nowInMs = Date.now()
            let result = handLandmarker.recognizeForVideo(video, nowInMs, {
              rotationDegrees: 0,
            })
            // console.log(result)
            array.map((r) => {
              r.visible = false
              return r
            })
            {
              stick.visible = false
            }
            let cam = get().camera
            let target = get().controlsTarget
            if (cam && target) {
              let vp = {
                width: 25,
                height: 25,
              }
              set({ handResult: result || [] })
              if (vp && result && result?.landmarks?.length > 0) {
                {
                  stick.visible = true
                }
                result.landmarks.forEach((lmk, handIndex) => {
                  let vpx = (lmk[0].x * 2.0 - 1.0) * vp.width
                  let vpy = (lmk[0].y * 2.0 - 1.0) * vp.height
                  let vpz = lmk[0].z

                  for (let bone = 0; bone < eachHandPointCount; bone++) {
                    let hand = array[handIndex * eachHandPointCount + bone]
                    let wmk = result.worldLandmarks[handIndex][bone]
                    goal.position.set(-wmk.x, -wmk.y, wmk.z).multiplyScalar(20)
                    goal.position.x += -vpx
                    goal.position.y += -vpy
                    goal.position.z += -vpz

                    hand.position.lerp(goal.position, 0.5)
                    hand.visible = true

                    if (bone === 1) {
                      hand.visible = false
                    }
                    if (bone === 2) {
                      hand.visible = false
                    }
                  }

                  b4midOfAB2C.position.lerpVectors(
                    array[handIndex * eachHandPointCount + 3].position,
                    array[handIndex * eachHandPointCount + 7].position,
                    0.5,
                  )

                  b4midOfCD2E.position.lerpVectors(
                    b4midOfAB2C.position,
                    array[handIndex * eachHandPointCount + 11].position,
                    0.5,
                  )

                  midOfAB2C.position.lerpVectors(
                    array[handIndex * eachHandPointCount + 4].position,
                    array[handIndex * eachHandPointCount + 8].position,
                    0.5,
                  )

                  midOfCD2E.position.lerpVectors(
                    midOfAB2C.position,
                    array[handIndex * eachHandPointCount + 12].position,
                    0.5,
                  )

                  {
                    let camera = get().camera

                    raycaster.setFromCamera(
                      {
                        x: -(lmk[0].x * 2.0 - 1.0),
                        y: -(lmk[1].y * 2.0 - 1.0),
                      },
                      camera,
                    )

                    stick.scale.setScalar(1)
                    stick.position.copy(array[handIndex * eachHandPointCount + 9].position)
                    stick.lookAt(
                      array[handIndex * eachHandPointCount + 9].position.x,
                      array[handIndex * eachHandPointCount + 9].position.y,
                      array[handIndex * eachHandPointCount + 9].position.z - 5,
                    )

                    let casterGroup = get().scene.getObjectByName('raycast-group')
                    if (casterGroup) {
                      //
                      let res = raycaster.intersectObject(casterGroup, true)
                      if (res) {
                        set({
                          activeObjects: [
                            res.map((r) => {
                              r.object.userData.raycastPoint = r.point
                              return r.object
                            })[0],
                          ],
                        })
                      }
                    }
                  }

                  {
                    {
                      //\
                      let latestGesture = result.gestures[0][0].categoryName
                      if (latestGesture === 'Closed_Fist') {
                        set((b4) => {
                          if (b4.picking && b4.picking?.length === 0 && get()?.activeObjects[0]) {
                            let first = get()?.activeObjects[0]

                            if (plane) {
                              first.getWorldPosition(plane.position)
                            }

                            return { ...b4, picking: [first] }
                          } else {
                            return { ...b4 }
                          }
                        })
                      } else {
                        set((b4) => {
                          if (b4.picking && b4.picking.length > 0) {
                            return { ...b4, picking: [] }
                          } else {
                            return { ...b4 }
                          }
                        })
                      }
                    }
                  }

                  //
                })
                //
              }
            }
          }
        },
      })
    },
  }
})
