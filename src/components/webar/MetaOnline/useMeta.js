import { create } from 'zustand'
import { Box3, Clock, Line3, Matrix4, Mesh, MeshStandardMaterial, Object3D, Spherical, Vector3 } from 'three'
import { OrbitControls, RoundedBoxGeometry } from 'three-stdlib'
import { sceneToCollider } from './sceneToCollider'

export class YoMeta extends Object3D {
  constructor({ camera, gl }) {
    super()

    this.offsetY = 0.5

    this.camera = camera
    // this.camera.fov = 75
    // if (window.innerWidth <= 500) {
    //   this.camera.fov = 90
    // }
    this.camera.updateProjectionMatrix()
    this.controls = new OrbitControls(camera.clone(), gl.domElement)
    this.controls.enableDamping = false
    this.controls.enabled = false

    this.clean = () => {
      this.controls.dispose()
    }

    this.reset = () => {
      this.playerVelocity.set(0, 0, 0)
      this.player.position.set(0, 1.52, 0)
      this.camera.position.x = 0
      this.camera.position.y = 0
      this.camera.position.z = 1
      this.player.visible = false
      this.controls.rotateSpeed = -0.5

      // this.camera.position.sub(this.controls.target)
      // this.controls.target.copy(this.player.position)
      // this.camera.position.add(this.player.position)
      this.controls.update()
    }

    this.keyState = {
      joyStickDown: false,
      joyStickAngle: 0,
      joyStickPressure: 0,
      joyStickSide: 0,
    }
    this.params = {
      firstPerson: false,

      displayCollider: false,
      displayBVH: false,
      visualizeDepth: 10,
      gravity: -30,
      playerSpeed: 10,
      physicsSteps: 5,

      fwdPressed: false,
      bkdPressed: false,
      rgtPressed: false,
      lftPressed: false,

      playerIsOnGround: false,

      reset: this.reset,
      toggleFirstPerson: () => {
        // if (!this.params.firstPerson) {
        //   this.camera.position.sub(this.controls.target).normalize().multiplyScalar(0.1).add(this.controls.target)
        // } else {
        //   this.camera.position.sub(this.controls.target).normalize().multiplyScalar(10).add(this.controls.target)
        // }
        // this.params.firstPerson = !this.params.firstPerson
        // this.controls.update()
      },
    }

    let down = (e) => {
      switch (e.code) {
        case 'KeyW':
          this.params.fwdPressed = true
          break
        case 'KeyS':
          this.params.bkdPressed = true
          break
        case 'KeyD':
          this.params.rgtPressed = true
          break
        case 'KeyA':
          this.params.lftPressed = true
          break
        case 'Space':
          if (this.playerIsOnGround) {
            this.playerVelocity.y = 10.0
          }

          break
      }
    }

    let up = (e) => {
      switch (e.code) {
        case 'KeyW':
          this.params.fwdPressed = false
          break
        case 'KeyS':
          this.params.bkdPressed = false
          break
        case 'KeyD':
          this.params.rgtPressed = false
          break
        case 'KeyA':
          this.params.lftPressed = false
          break
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', up)
    window.addEventListener('focus', up)
    window.addEventListener('cancel-move', () => {
      this.params.fwdPressed = false
      this.params.bkdPressed = false
      this.params.rgtPressed = false
      this.params.lftPressed = false
    })

    //
    this.weakMap = new WeakMap()
    this.parseScene = async ({ scene }) => {
      if (this.weakMap.has(scene)) {
        this.weakMap.get(scene).then((collider) => {
          this.collider = collider
          useMeta.setState({ collider })
          this.reset()
        })
        return
      }

      let prom = sceneToCollider({ scene })
      this.weakMap.set(scene, prom)
      return prom.then((collider) => {
        this.collider = collider
        useMeta.setState({ collider })

        this.reset()
      })
    }

    // character
    this.player = new Mesh(new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5), new MeshStandardMaterial({}))
    this.player.geometry.translate(0, -0.5, 0)
    this.player.position.y = 1.87
    this.player.capsuleInfo = {
      radius: 0.5,
      segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
    }
    this.player.castShadow = true
    this.player.receiveShadow = true
    this.player.material.shadowSide = 2

    this.clock = new Clock()
    this.upVector = new Vector3(0, 1, 0)
    this.playerVelocity = new Vector3()
    this.tempBox = new Box3()
    this.tempMat = new Matrix4()
    this.tempVector = new Vector3()
    this.tempVector2 = new Vector3()
    this.tempSegment = this.player.capsuleInfo.segment.clone()

    this.globalCameraPos = new Vector3()
    this.spherical = new Spherical()
    this.deltaRot = new Vector3()

    this.updatePlayer = () => {
      if (!this.controls) {
        return
      }
      if (!this.collider) {
        return
      }
      if (!this.camera) {
        return
      }
      this.controls.update()

      let delta = this.clock.getDelta()
      this.playerVelocity.y += this.playerIsOnGround ? 0 : delta * this.params.gravity
      this.player.position.addScaledVector(this.playerVelocity, delta)

      const angle = this.controls.getAzimuthalAngle()

      if (this.params.fwdPressed) {
        this.tempVector.set(0, 0, -1).applyAxisAngle(this.upVector, angle)
        this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta)
      }

      if (this.params.bkdPressed) {
        this.tempVector.set(0, 0, 1).applyAxisAngle(this.upVector, angle)
        this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta)
      }

      if (this.params.lftPressed) {
        this.tempVector.set(-1, 0, 0).applyAxisAngle(this.upVector, angle)
        this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta)
      }

      if (this.params.rgtPressed) {
        this.tempVector.set(1, 0, 0).applyAxisAngle(this.upVector, angle)
        this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta)
      }

      if (this.keyState.joyStickDown) {
        this.tempVector.set(0, 0, -1).applyAxisAngle(this.upVector, angle + this.keyState.joyStickAngle)

        this.controls.object.getWorldPosition(this.globalCameraPos)
        this.globalCameraPos.y = this.controls.target.y
        let dist = this.controls.target.distanceTo(this.globalCameraPos)

        this.deltaRot.setFromCylindricalCoords(
          dist,
          this.controls.getAzimuthalAngle() + 0.2 * delta * this.keyState.joyStickSide * 15.0,
        )
        let y = this.camera.position.y
        this.camera.position.sub(this.controls.target)
        this.camera.position.copy(this.deltaRot)
        this.camera.position.add(this.controls.target)
        this.camera.position.y = y

        this.player.position.addScaledVector(
          this.tempVector,
          this.params.playerSpeed * delta * this.keyState.joyStickPressure * 0.75,
        )
      }

      this.player.updateMatrixWorld()

      // adjust player position based on collisions
      const capsuleInfo = this.player.capsuleInfo
      this.tempBox.makeEmpty()
      this.tempMat.copy(this.collider.matrixWorld).invert()
      this.tempSegment.copy(capsuleInfo.segment)

      // get the position of the capsule in the local space of the collider
      this.tempSegment.start.applyMatrix4(this.player.matrixWorld).applyMatrix4(this.tempMat)
      this.tempSegment.end.applyMatrix4(this.player.matrixWorld).applyMatrix4(this.tempMat)

      // get the axis aligned bounding box of the capsule
      this.tempBox.expandByPoint(this.tempSegment.start)
      this.tempBox.expandByPoint(this.tempSegment.end)

      this.tempBox.min.addScalar(-capsuleInfo.radius)
      this.tempBox.max.addScalar(capsuleInfo.radius)

      this.collider.geometry.boundsTree.shapecast({
        intersectsBounds: (box) => box.intersectsBox(this.tempBox),

        intersectsTriangle: (tri) => {
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          const triPoint = this.tempVector
          const capsulePoint = this.tempVector2

          const distance = tri.closestPointToSegment(this.tempSegment, triPoint, capsulePoint)
          if (distance < capsuleInfo.radius) {
            const depth = capsuleInfo.radius - distance
            const direction = capsulePoint.sub(triPoint).normalize()

            this.tempSegment.start.addScaledVector(direction, depth)
            this.tempSegment.end.addScaledVector(direction, depth)
          }
        },
      })

      // get the adjusted position of the capsule collider in world space after checking
      // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
      // the origin of the player model.
      const newPosition = this.tempVector
      newPosition.copy(this.tempSegment.start).applyMatrix4(this.collider.matrixWorld)

      // check how much the collider was moved
      const deltaVector = this.tempVector2
      deltaVector.subVectors(newPosition, this.player.position)

      // if the player was primarily adjusted vertically we assume it's on something we should consider ground
      this.playerIsOnGround = deltaVector.y > Math.abs(delta * this.playerVelocity.y * 0.25)

      const offset = Math.max(0.0, deltaVector.length() - 1e-5)
      deltaVector.normalize().multiplyScalar(offset)

      // adjust the player model
      this.player.position.add(deltaVector)

      if (!this.playerIsOnGround) {
        deltaVector.normalize()
        this.playerVelocity.addScaledVector(deltaVector, -deltaVector.dot(this.playerVelocity))
      } else {
        this.playerVelocity.set(0, 0, 0)
      }

      // adjust the camera
      this.player.position.y += this.offsetY
      this.camera.position.sub(this.controls.target)
      this.controls.target.copy(this.player.position)
      this.camera.position.add(this.player.position)
      this.player.position.y -= this.offsetY

      // if the player has fallen too far below the level reset their position to the start
      if (this.player.position.y < -25) {
        this.params.reset()
      }
    }
  }
}

export const useMeta = create((set, get) => {
  return {
    renderMode: 'smooth',
    showPhase: 'menu',
    game: false,
  }
})
