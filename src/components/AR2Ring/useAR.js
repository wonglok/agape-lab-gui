import {
  BoxGeometry,
  CircleGeometry,
  DoubleSide,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Object3D,
  Quaternion,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { Clock, PlaneGeometry } from 'three147'
import { create } from 'zustand'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'

export const useAR = create((set, get) => {
  return {
    imu: false,
    cam: false, // media

    scene: false,
    renderer: false,

    useIMU: true,
    //
    showStartMenu: true,

    ring: new Object3D(),
    cursor: new Object3D(),

    onStart: async () => {
      const config = {
        video: {
          facingMode: 'environment',
          aspectRatio: 16 / 9,
          width: { ideal: 1280 },
        },
        audio: false,
      }
      let { IMU } = await window.remoteImport('/ar2/imu.js')
      let { Camera } = await window.remoteImport('/ar2/utils.js')
      let { AlvaAR } = await window.remoteImport('/ar2/alva_ar.js')
      // let { ARCamIMUView } = await window.remoteImport('/ar2/view.js')
      let { onFrame, resize2cover } = await window.remoteImport('/ar2/utils.js')

      const imu = await IMU.Initialize()
      const cam = await Camera.Initialize(config)
      //
      const imuResult = await imu

      console.log(imuResult)
      const container = document.querySelector('#vidContainer')
      const canvas = document.querySelector('#vidCanvas')
      const video = cam.el

      const size = resize2cover(video.videoWidth, video.videoHeight, container.clientWidth, container.clientHeight)

      console.log(container.clientWidth, container.clientHeight)

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      video.style.width = size.width + 'px'
      video.style.height = size.height + 'px'

      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
      })

      let ground = new Mesh(
        new PlaneGeometry(1000, 1000, 200, 200),
        new MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          depthTest: true,
          opacity: 1,
          wireframe: true,
          side: DoubleSide,
        }),
      )

      ground.rotation.x = Math.PI / -2 // 90 deg
      ground.position.y = -3

      const alva = await AlvaAR.Initialize(canvas.width, canvas.height)

      setTimeout(() => {
        set({
          raycaster: new Raycaster(),
          ground,
          imu: imuResult,
          reset: () => {
            alva.reset()
          },
          cam,
          size,
          alva,
          ctx,
          canvas: canvas,
          video: video,
        })

        set({ showStartMenu: false })
      }, 10)
      //
    },

    updateCameraPose: (pose, rotationQuaternion, translationVector) => {
      console.log('updateCameraPose')

      const m = new Matrix4().fromArray(pose)
      const r = new Quaternion().setFromRotationMatrix(m)
      const t = new Vector3(pose[12], pose[13], pose[14])

      rotationQuaternion !== null && rotationQuaternion.set(-r.x, r.y, r.z, r.w)
      translationVector !== null && translationVector.set(t.x, -t.y, -t.z)
    },
    reset: () => {
      get().alva.reset()
    },
    lostCamera: () => {
      //!SECTION
      console.log('lostCamera')
    },
    addObjectAt: (x, y, scale = 0.2) => {
      let self = get()
      // const el = self.renderer.domElement

      // const coord = new Vector2((x / el.offsetWidth) * 2 - 1, -(y / el.offsetHeight) * 2 + 1)

      // self.raycaster.setFromCamera(coord, self.camera)

      // const intersections = self.raycaster.intersectObjects([self.ground])

      // if (intersections.length > 0) {
      //   // const point = intersections[0].point

      //   // const object = new Mesh(new IcosahedronGeometry(1, 0), new MeshNormalMaterial({ flatShading: true }))

      //   // object.scale.set(scale, scale, scale)
      //   // object.position.set(point.x, point.y, point.z)
      //   // object.custom = true

      //   // self.scene.add(object)

      // }

      let ring = get().ring
      let insertObj = clone(ring)

      insertObj.scale.set(12.5, 12.5, 12.5)

      let pos = get().cursor.position
      insertObj.position.set(pos.x, pos.y, pos.z)
      insertObj.custom = true

      let clock = new Clock()
      let rAF = () => {
        requestAnimationFrame(rAF)
        insertObj.rotation.y += clock.getDelta() * 0.8
      }
      requestAnimationFrame(rAF)
      self.scene.add(insertObj)
    },
    onFrame: ({ camera }) => {
      //
      let { ctx, canvas, video, size, imu, alva, ground } = get()

      if (!ctx || !canvas || !video || !size || !imu || !alva || !ground) {
        return
      }
      // if (imu.screenOrientation === null) {
      //   return
      // }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (!document['hidden']) {
        // Stats.start('video')
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, size.x, size.y, size.width, size.height)
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // Stats.stop('video')

        // console.log(frame, imu.orientation, imu.motion)

        if (get().useIMU) {
          try {
            // Stats.start('slam')
            const pose = alva.findCameraPoseWithIMU(frame, imu.orientation, imu.motion)
            // Stats.stop('slam')

            if (pose) {
              get().updateCameraPose(pose, camera.quaternion, camera.position)

              // ground.position.x = camera.position.x
              // ground.position.z = camera.position.z
            } else {
              get().lostCamera()

              const dots = alva.getFramePoints()

              for (const p of dots) {
                ctx.fillStyle = 'white'
                ctx.fillRect(p.x, p.y, 2, 2)
              }
            }
          } catch (e) {
            console.log(e)
            set({ useIMU: false })
          }
        } else {
          // Stats.start('slam')
          const pose = alva.findCameraPose(frame, imu.orientation, imu.motion)
          // Stats.stop('slam')

          if (pose) {
            get().updateCameraPose(pose, camera.quaternion, camera.position)

            // ground.position.x = camera.position.x
            // ground.position.z = camera.position.z
          } else {
            get().lostCamera()

            const dots = alva.getFramePoints()

            for (const p of dots) {
              ctx.fillStyle = 'white'
              ctx.fillRect(p.x, p.y, 2, 2)
            }
          }
        }
      }
    },
  }
})
