import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { AlvaARConnectorTHREE } from './assets/alva_ar_three.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { Object3D } from 'three'

export class MyView {
  constructor(container, width, height, x = 0, y = 1, z = -1, scale = 0.1) {
    this.applyPose = AlvaARConnectorTHREE.Initialize(THREE)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearColor(0, 0)
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.rotation.reorder('YXZ')
    this.camera.updateProjectionMatrix()

    this.object = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.MeshNormalMaterial({ flatShading: true }),
    )
    this.object.scale.set(scale, scale, scale)
    this.object.position.set(x, y, z)
    this.object.visible = false

    this.box = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 100, 4, 4, 4),
      new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        depthTest: true,
        wireframe: true,
        opacity: 0.4,
      }),
    )
    this.box.visible = false

    this.scene = new THREE.Scene()
    this.scene.add(new THREE.AmbientLight(0x808080))
    this.scene.add(new THREE.HemisphereLight(0x404040, 0xf0f0f0, 1))
    this.scene.add(this.camera)
    this.scene.add(this.object)
    this.scene.add(this.box)

    let load = new GLTFLoader()
    let draco = new DRACOLoader()
    draco.setDecoderPath('/draco/')
    load.setDRACOLoader(draco)
    load.loadAsync(`/2022/03/19/ar/garage-6.glb`).then((glb) => {
      let o3 = new Object3D()
      o3.add(glb.scene)

      // glb.scene.position.y = -5
      this.scene.add(o3)
    })

    let rgbe = new RGBELoader()
    rgbe.loadAsync(`/envMap/evening_road_01_puresky_1k.hdr`).then((rgb) => {
      rgb.mapping = THREE.EquirectangularReflectionMapping
      this.scene.environment = rgb
    })
    container.appendChild(this.renderer.domElement)

    this.cameraPositionCurr = new THREE.Vector3(0, 0, 0)
    this.cameraPositionPrev = new THREE.Vector3(0, 0, 0)

    this.camera.position.y = 5
    const render = () => {
      requestAnimationFrame(render.bind(this))

      this.renderer.render(this.scene, this.camera)
    }

    render()
  }

  updateCameraPose(pose) {
    this.applyPose(pose, this.camera.quaternion, this.camera.position)

    this.object.visible = true
    this.box.visible = true
  }

  updateCameraPoseDeviceOrient(pose, alpha, beta, gamma, screenAngle) {
    const orientation = THREE.MathUtils.degToRad(screenAngle)
    const axis = new THREE.Vector3(0, 0, 1)
    const euler = new THREE.Euler()
    const q0 = new THREE.Quaternion()
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis

    // 'ZXY' for the device, but 'YXZ' for us
    euler.set(beta, alpha, -gamma, 'YXZ')

    // orient the device
    this.camera.quaternion.setFromEuler(euler)

    // camera looks out the back of the device, not the top
    this.camera.quaternion.multiply(q1)

    // adjust for screen orientation
    this.camera.quaternion.multiply(q0.setFromAxisAngle(axis, -orientation))

    this.prevQuaternion = this.prevQuaternion || new THREE.Quaternion()

    if (8 * (1 - this.prevQuaternion.dot(this.camera.quaternion)) > 0.000001) {
      this.prevQuaternion.copy(this.camera.quaternion)
    }

    this.cameraPositionPrev.copy(this.cameraPositionCurr)

    if (pose) {
      this.applyPose(pose, null, this.cameraPositionCurr)
    }

    this.camera.position.set(
      this.camera.position.x + this.cameraPositionCurr.x - this.cameraPositionPrev.x,
      this.camera.position.y + this.cameraPositionCurr.y - this.cameraPositionPrev.y,
      this.camera.position.z + this.cameraPositionCurr.z - this.cameraPositionPrev.z,
    )
  }

  lostCamera() {
    this.object.visible = false
    this.box.visible = false
  }
}
