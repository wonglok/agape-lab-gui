import * as THREE from 'three'
import vert from './shaders/rgbd.vert'
import frag from './shaders/rgbd.frag'

/**
 * Originally written by
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 */

/* Made into a plugin after the completion of the Tzina project by
 *  @author juniorxsound / http://orfleisher.com
 *  @modified by avnerus / http://avner.js.org
 */

//Three.js - for easy debugging and testing, should be excluded from the build
// import * as THREE from 'three'

// bundling of GLSL code
// const glsl = require('glslify')

//For building the geomtery
const VERTS_WIDE = 64
const VERTS_TALL = 128

export class VideoEl {
  constructor({ _movie, _poster }) {
    //Crate video element
    this.video = document.createElement('video')

    //Set the crossOrigin and props
    this.video.id = 'depthkit-video'
    this.video.crossOrigin = 'anonymous'
    this.video.setAttribute('crossorigin', 'anonymous')
    this.video.setAttribute('webkit-playsinline', 'webkit-playsinline')
    this.video.setAttribute('playsinline', 'playsinline')
    this.video.src = _movie
    this.video.poster = _poster

    //Don't autostart don't loop
    this.video.autoplay = true
    this.video.loop = false
    this.video.muted = true
    this.video.load()
    this.video.oncanplay = () => {
      this.video.play()
      this.videoTexture.needsUpdate = true
    }

    //Create a video texture to be passed to the shader
    this.videoTexture = new THREE.VideoTexture(this.video)
    // this.videoTexture = new THREE.TextureLoader().load(`/assets/compressed/num.png`)
    // this.videoTexture.minFilter = THREE.NearestFilter
    // this.videoTexture.magFilter = THREE.LinearFilter
    // this.videoTexture.wrapS = THREE.RepeatWrapping
    // this.videoTexture.wrapT = THREE.RepeatWrapping
    // this.videoTexture.format = THREE.RGBAFormat
    // this.videoTexture.generateMipmaps = true
  }
}

export default class DepthKit extends THREE.Object3D {
  get video() {
    return this.videoEl.video
  }
  get videoTexture() {
    return this.videoEl.videoTexture
  }
  constructor(_type = 'mesh', _videoEl, _props) {
    super()
    // this.works = []
    // this.onLoop = () => {}

    // this.rAFID = 0

    // this.rAF = () => {
    //   this.rAFID = requestAnimationFrame(this.rAF)
    //   this.works.forEach((r) => r())
    // }
    // this.rAFID = requestAnimationFrame(this.rAF)

    // this.cleans = []
    // this.onClean = (v) => {
    //   this.cleans.push(v)
    // }
    // this.clean = () => {
    //   this.works = []
    //   this.cleans.forEach((r) => r())
    // }
    this.total = 10
    this.depthkit = this

    //Load the shaders
    let rgbdFrag = frag // glsl.file('./shaders/rgbd.frag')
    let rgbdVert = vert // glsl.file('./shaders/rgbd.vert')

    this.videoEl = _videoEl

    //Manages loading of assets internally
    // this.manager = new THREE.LoadingManager()

    //JSON props once loaded
    this.props = false

    //Geomtery
    if (!DepthKit.geo) {
      DepthKit.geo = DepthKit.buildGeomtery()
    }

    let getUnis = () => {
      return {
        map: {
          type: 't',
          value: this.videoTexture,
        },
        time: {
          type: 'f',
          value: 0.0,
        },
        mindepth: {
          type: 'f',
          original: 0.0,
          value: 0.0,
        },
        maxdepth: {
          type: 'f',
          original: 0.0,
          value: 0.0,
        },
        meshDensity: {
          value: new THREE.Vector2(VERTS_WIDE, VERTS_TALL),
        },
        focalLength: {
          value: new THREE.Vector2(1, 1),
        },
        principalPoint: {
          value: new THREE.Vector2(1, 1),
        },
        imageDimensions: {
          value: new THREE.Vector2(512, 828),
        },
        extrinsics: {
          value: new THREE.Matrix4(),
        },
        crop: {
          value: new THREE.Vector4(0, 0, 1, 1),
        },
        width: {
          type: 'f',
          value: 0,
        },
        height: {
          type: 'f',
          value: 0,
        },
        opacity: {
          type: 'f',
          value: 1.0,
        },
        isPoints: {
          type: 'b',
          value: false,
        },
        pointSize: {
          type: 'f',
          value: 3.0,
        },
        offset: {
          value: new THREE.Vector2(0, 0),
        },
        scale: {
          value: new THREE.Vector2(1, 1),
        },
        merger: {
          value: -3,
        },
      }
    }

    //Material
    this.material0 = new THREE.ShaderMaterial({
      uniforms: getUnis(),
      vertexShader: rgbdVert,
      fragmentShader: rgbdFrag,
      transparent: true,
    })

    //Make the shader material0 double sided
    this.material0.side = THREE.DoubleSide

    let self = this
    let makeMesh = (meshKey, materialKey) => {
      switch (_type) {
        case 'wire':
          self[materialKey].wireframe = true
          // self[meshKey] = new THREE.Mesh(DepthKit.geo, self[materialKey])
          self[meshKey] = new THREE.Mesh(DepthKit.geo, self[materialKey])
          break

        case 'points':
          self[materialKey].uniforms.isPoints.value = true
          self[meshKey] = new THREE.Points(DepthKit.geo, self[materialKey])
          break

        default:
          self[meshKey] = new THREE.Mesh(DepthKit.geo, self[materialKey])
          break
      }

      //Make sure we don't hide the character - this helps the objects in webVR
      self[meshKey].frustumCulled = false

      //Apend the object to the Three Object3D that way it's accsesable from the instance
      self[meshKey].depthkit = this
      self[meshKey].name = 'depthkit'

      return self[meshKey]
    }

    this.allMeshes = []
    this.allMaterials = []
    for (let i = 0; i < this.total; i++) {
      this[`material${i}`] = this.material0.clone()
      this[`material${i}`].uniforms = getUnis()
      this[`mesh${i}`] = makeMesh(`mesh${i}`, `material${i}`)
      // this.add(this[`mesh${i}`])

      this[`mesh${i}`].name = `mesh${i}`
      this.allMeshes.push(this[`mesh${i}`])
      this.allMaterials.push(this[`material${i}`])
      // this[`mesh${i}`].add()

      if (i === 0) {
        this[`mesh${i}`].visible = true
      } else {
        this[`mesh${i}`].visible = true
      }
      this[`mesh${i}`].visible = true

      this[`mesh${i}`].myGrandParent = new THREE.Object3D()
      this[`mesh${i}`].myParent = new THREE.Object3D()

      this[`mesh${i}`].myGrandParent.add(this[`mesh${i}`].myParent)
      this[`mesh${i}`].myParent.add(this[`mesh${i}`])
      this.add(this[`mesh${i}`].myGrandParent)
    }

    //Switch a few things based on selected rendering type and create the mesh
    let dict = new Map()
    this.dict = dict

    let lookup = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],

      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],

      // [0, 1],
      // [1, 1],
      // [2, 1],
      // [3, 1],
      // [4, 1],
    ]
    this.lookup = lookup

    //Make sure to read the config file as json (i.e JSON.parse)
    this.jsonLoader = new THREE.FileLoader()
    this.jsonLoader.setResponseType('json')
    this.jsonLoader.load(
      _props,
      // Function when json is loaded
      (data) => {
        this.props = data

        // console.log(this.props);
        // console.log(data)

        // 5 = 2, 1

        // dict.set(7, [0, 0]) // good
        // dict.set(4, [1, 1]) // good
        // dict.set(1, [2, 1]) // good

        // dict.set(bad, [0, 1])

        // dict.set(7, {
        //   slots: [0, 0],
        // })
        // dict.set(4, {
        //   slots: [1, 1],
        // })

        // dict.set(1, {
        //   slots: [2, 1],
        // })

        // dict.set(5, {
        //   slots: [2, 1],
        // })

        //

        // dict.set(4, [4, 0])
        // dict.set(5, [0, 0])
        // dict.set(6, [1, 0])
        // dict.set(7, [2, 0])
        // dict.set(8, [3, 0])
        // dict.set(9, [4, 0])

        //

        data.perspectives.forEach((dataEach, idx) => {
          let materialKey = `material${idx}`
          let meshKey = `mesh${idx}`

          this[materialKey].uniforms.width.value = data.textureWidth
          this[materialKey].uniforms.height.value = data.textureHeight

          this[materialKey].uniforms.mindepth.value = dataEach.nearClip
          this[materialKey].uniforms.maxdepth.value = dataEach.farClip

          this[materialKey].uniforms.mindepth.original = dataEach.nearClip
          this[materialKey].uniforms.maxdepth.original = dataEach.farClip

          this[materialKey].uniforms.focalLength.value.copy(dataEach.depthFocalLength)
          this[materialKey].uniforms.principalPoint.value.copy(dataEach.depthPrincipalPoint)
          this[materialKey].uniforms.imageDimensions.value.copy(dataEach.depthImageSize)
          this[materialKey].uniforms.crop.value.copy(dataEach.crop)

          let ex = dataEach.extrinsics
          let m4ex = new THREE.Matrix4().set(
            ex['e00'],
            ex['e10'],
            ex['e20'],
            ex['e30'],
            ex['e01'],
            ex['e11'],
            ex['e21'],
            ex['e31'],
            ex['e02'],
            ex['e12'],
            ex['e22'],
            ex['e32'],
            ex['e03'],
            ex['e13'],
            ex['e23'],
            ex['e33'],
          )

          // m4ex.identity()

          this[meshKey].m4ex = m4ex.clone()

          let o3d = new THREE.Object3D()
          this[meshKey].o3d = o3d
          m4ex.decompose(o3d.position, o3d.quaternion, o3d.scale)
          m4ex.compose(o3d.position, o3d.quaternion, o3d.scale)

          //m4ex
          this[materialKey].uniforms.extrinsics.value.copy(new THREE.Matrix4())
          this[meshKey].userData.mx = m4ex

          let work = (x, y) => {
            this[materialKey].uniforms.offset.value.x = x / data.numColumns
            this[materialKey].uniforms.offset.value.y = y / data.numRows
            this[materialKey].uniforms.scale.value.x = 1 / data.numColumns
            this[materialKey].uniforms.scale.value.y = 1 / data.numRows
          }

          this[`sync${idx}`] = () => {
            if (dict.has(idx)) {
              if (dict.get(idx).slots) {
                this['mesh' + idx].visible = true
                work(...dict.get(idx).slots)
              } else {
                this['mesh' + idx].visible = false
              }
            } else {
              // this['mesh' + idx].visible = false
            }
          }

          this[`sync${idx}`]()
        })
      },
    )
  }

  static buildGeomtery() {
    const geometry = new THREE.BufferGeometry()
    const verts = []
    const faces = []

    for (let y = 0; y < VERTS_TALL; y++) {
      for (let x = 0; x < VERTS_WIDE; x++) {
        verts.push(x, y, 0)
      }
    }
    for (let _y = 0; _y < VERTS_TALL - 1; _y++) {
      for (let _x2 = 0; _x2 < VERTS_WIDE - 1; _x2++) {
        faces.push(
          _x2 + _y * VERTS_WIDE,
          _x2 + (_y + 1) * VERTS_WIDE,
          _x2 + 1 + _y * VERTS_WIDE,
          _x2 + 1 + _y * VERTS_WIDE,
          _x2 + (_y + 1) * VERTS_WIDE,
          _x2 + 1 + (_y + 1) * VERTS_WIDE,
        )
      }
    }

    // set the attributes of the geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geometry.setIndex(new THREE.Uint16BufferAttribute(faces, 1))

    return geometry
  }

  /*
   * Render related methods
   */
  setPointSize(size) {
    for (let i = 0; i < this.total; i++) {
      if (this[`material${i}`].uniforms.isPoints.value) {
        this[`material${i}`].uniforms.pointSize.value = size
      } else {
        console.warn('Can not set point size because the current character is not set to render points')
      }
    }
  }

  setOpacity(opacity) {
    this.material0.uniforms.opacity.value = opacity
  }

  setLineWidth(width) {
    if (this.material0.wireframe) {
      this.material0.wireframeLinewidth = width
    } else {
      console.warn('Can not set the line width because the current character is not set to render wireframe')
    }
  }

  /*
   * Video Player methods
   */
  play() {
    if (!this.video.isPlaying) {
      this.video.play()
    } else {
      console.warn('Can not play because the character is already playing')
    }
  }

  stop() {
    this.video.currentTime = 0.0
    this.video.pause()
  }

  pause() {
    this.video.pause()
  }

  setLoop(isLooping) {
    this.video.loop = isLooping
  }

  setVolume(volume) {
    this.video.volume = volume
  }

  update() {
    let t = window.performance.now() / 1000
    this.allMaterials.forEach((mat) => {
      mat.uniforms.time.value = t
    })
  }

  toggleColliderVisiblity() {
    let yo = false
    this.mesh0.traverse((it) => {
      if (it.geometry) {
        //
        if (!yo) {
          yo = it
        }
      }
    })
    // yo.visible = !yo.visible
  }

  dispose() {
    this.removeFromParent()
    this.traverse((it) => {
      if (it.geometry) {
        it.geometry.dispose()
      }
      if (it.material) {
        it.material.dispose()
      }
    })
    // //Remove the mesh from the scene
    // try {
    //   this.mesh0.parent.remove(this.mesh0)
    // } catch (e) {
    //   console.warn(e)
    // } finally {
    //   this.mesh0.traverse((child) => {
    //     if (child.geometry !== undefined) {
    //       child.geometry.dispose()
    //       child.material0.dispose()
    //     }
    //   })
    // }
  }
}
