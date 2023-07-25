import { extend } from '@react-three/fiber'
// import { generateUUID } from 'three/src/math/MathUtils'
import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  Mesh,
  MeshPhysicalMaterial,
  // Mesh,
  // MeshStandardMaterial,
  // SphereBufferGeometry,
  Object3D,
  ShaderMaterial,
  TextureLoader,
  sRGBEncoding,
} from 'three'
import { CustomGPU } from './CustomGPU'
import fragmentShaderVel from './shader/fragmentShaderVel.frag'
import fragmentShaderPos from './shader/fragmentShaderPos.frag'
import fragmentShaderOffset from './shader/fragmentShaderOffset.frag'
import computeBody from './shader/computeBody.frag'
import md5 from 'md5'
import displayFragment from './shader/display.frag'
import displayVertex from './shader/display.vert'
import { DoubleSide } from 'three'
import { PlaneGeometry } from 'three'
import { Texture, Vector2 } from 'three147'
// import { useEffect, useMemo } from 'react'
// import { create } from 'zustand'

export class MyCloth extends Object3D {
  constructor({ gl, mouse }) {
    super()
    // In each frame...

    let tsks = []
    let cleans = []
    let rAFID = 0

    let rAF = () => {
      rAFID = window.requestAnimationFrame(rAF)
      tsks.forEach((r) => r())
    }
    rAFID = window.requestAnimationFrame(rAF)
    this.core = {
      clean() {
        cancelAnimationFrame(rAFID)
        cleans.forEach((r) => r())
      },
      onLoop(v) {
        tsks.push(v)
      },
      onClean(v) {
        cleans.push(v)
      },
    }

    this.dispose = () => {
      this.core.clean()
    }

    this.gl = gl
    this.viewSizeX = 10
    this.viewSizeY = 10
    this.sizeX = 256
    this.sizeY = 256
    this.count = this.sizeX * this.sizeY
    this.gpu = new CustomGPU(this.sizeX, this.sizeY, this.gl)
    // Compute!

    // Create initial state float textures
    let meta0 = this.gpu.createTexture()
    let pos0 = this.gpu.createTexture()
    // pos0.generateMipmaps = true

    let vel0 = this.gpu.createTexture()
    // let offset0 = this.gpu.createTexture()
    let offset0 = this.gpu.createTexture()

    let i = 0
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        //
        meta0.image.data[i * 4 + 0] = x / this.sizeX
        meta0.image.data[i * 4 + 1] = y / this.sizeY
        meta0.image.data[i * 4 + 2] = 0.0
        meta0.image.data[i * 4 + 3] = 1
        i++
      }
    }
    meta0.needsUpdate = true

    i = 0.0
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        //
        pos0.image.data[i * 4 + 0] = 0.0
        pos0.image.data[i * 4 + 1] = 0.0
        pos0.image.data[i * 4 + 2] = 0.0
        pos0.image.data[i * 4 + 3] = 0.0
        i++
      }
    }
    pos0.needsUpdate = true

    // and fill in here the texture data...
    // let forceVar = this.gpu.addVariable(
    //   'textureForce',
    //   fragmentShaderForce,
    //   offset0
    // )

    let updatedFragmentShaderVel = fragmentShaderVel.replace(`#chunk-computeBody`, `${computeBody}`)

    let updatedFragmentShaderPos = fragmentShaderPos.replace(`#chunk-computeBody`, `${computeBody}`)

    let offsetVar = this.gpu.addVariable('textureOffset', fragmentShaderOffset, offset0)

    let velVar = this.gpu.addVariable('textureVelocity', updatedFragmentShaderVel, pos0)

    let posVar = this.gpu.addVariable('texturePosition', updatedFragmentShaderPos, vel0)

    // forceVar.material.uniforms.time = { value: 0 }
    velVar.material.uniforms.time = { value: 0 }
    posVar.material.uniforms.time = { value: 0 }
    offsetVar.material.uniforms.time = { value: 0 }

    // forceVar.material.uniforms.delta = { value: 0 }
    velVar.material.uniforms.delta = { value: 0 }
    posVar.material.uniforms.delta = { value: 0 }
    offsetVar.material.uniforms.delta = { value: 0 }

    // forceVar.material.uniforms.meta0 = { value: meta0 }
    velVar.material.uniforms.meta0 = { value: meta0 }
    posVar.material.uniforms.meta0 = { value: meta0 }
    offsetVar.material.uniforms.meta0 = { value: meta0 }

    // forceVar.material.uniforms.mouse = { value: mouse }
    velVar.material.uniforms.mouse = { value: mouse }
    posVar.material.uniforms.mouse = { value: mouse }
    offsetVar.material.uniforms.mouse = { value: mouse }

    velVar.material.uniforms.viewSizeXY = { value: new Vector2(this.viewSizeX, this.viewSizeY) }
    posVar.material.uniforms.viewSizeXY = { value: new Vector2(this.viewSizeX, this.viewSizeY) }
    offsetVar.material.uniforms.viewSizeXY = { value: new Vector2(this.viewSizeX, this.viewSizeY) }

    //
    // Add variable dependencies
    this.gpu.setVariableDependencies(offsetVar, [
      offsetVar,
      // forceVar,
      velVar,
      posVar,
    ])
    // this.gpu.setVariableDependencies(forceVar, [
    //   offsetVar,
    //   forceVar,
    //   velVar,
    //   posVar,
    // ])
    this.gpu.setVariableDependencies(velVar, [
      offsetVar,
      // forceVar,
      velVar,
      posVar,
    ])
    this.gpu.setVariableDependencies(posVar, [
      offsetVar,
      // forceVar,
      velVar,
      posVar,
    ])

    // Check for completeness
    let error = this.gpu.init()
    if (error !== null) {
      console.error(error)
    }

    this.core.onLoop(() => {
      this.gpu.compute()
    })

    //
    this.clock = new Clock()

    //
    this.getTexAPos = () => this.gpu.getCurrentRenderTarget(posVar).texture
    this.getTexAVel = () => this.gpu.getCurrentRenderTarget(velVar).texture
    this.getTexAOffset = () => this.gpu.getCurrentRenderTarget(offsetVar).texture

    //
    this.buff = new BufferGeometry()
    this.buff.setAttribute('position', new BufferAttribute(new Float32Array(pos0.image.data), 4))
    this.buff.setAttribute('meta0', new BufferAttribute(new Float32Array(meta0.image.data), 4))

    this.mat = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        delta: { value: 0 },
        pos0: { value: null },
        offset0: { value: null },
        vel0: { value: null },
      },
      vertexShader: displayVertex,
      fragmentShader: displayFragment,
    })

    this.core.onLoop((dt) => {
      //
      let et = this.clock.getElapsedTime()
      if (dt >= 1 / 60) {
        dt = 1 / 60
      }

      //
      velVar.material.uniforms.time.value = et
      posVar.material.uniforms.time.value = et
      velVar.material.uniforms.delta.value = dt
      posVar.material.uniforms.delta.value = dt

      this.mat.uniforms.time.value = et
      this.mat.uniforms.delta.value = dt
      this.mat.uniforms.pos0.value = this.getTexAPos()
      this.mat.uniforms.vel0.value = this.getTexAVel()
      this.mat.uniforms.offset0.value = this.getTexAOffset()
    })

    // this.pts = new Points(this.buff, this.mat)
    // this.pts.frustumCulled = false
    // this.add(this.pts)

    this.plane = new Mesh(
      new PlaneGeometry(this.viewSizeX, this.viewSizeY, this.sizeX, this.sizeY),
      getClothMaterial({
        sizeX: this.sizeX,
        sizeY: this.sizeY,
        getter: () => {
          return this.getTexAPos()
        },
        onLoop: (func) => {
          this.core.onLoop(() => {
            //

            func()

            //
          })
        },
      }),
    )
    this.plane.frustumCulled = false
    this.add(this.plane)

    // let arr = [`/bg/flower@1x.png`, `/bg/john-16-33.png`, `/bg/red@1x.png`, `/bg/anthem@1x.png`]
    // let cursor = 0

    // let load = ({ mat }) => {
    //   new TextureLoader().loadAsync(arr[cursor]).then((tex) => {
    //     tex.encoding = sRGBEncoding
    //     tex.generateMipmaps = false
    //     // mat.roughnessMap = tex
    //     // mat.metalnessMap = tex
    //     mat.map = tex
    //     mat.color = new Color('#ffffff')
    //     mat.emissiveMap = tex
    //     mat.emissive = new Color('#ffffff')
    //     cursor++
    //     cursor = cursor % arr.length
    //   })
    // }

    let agape = new TextureLoader().load(`/bg/flower@1x.png`)
    agape.encoding = sRGBEncoding

    this.plane.material.map = agape
    this.plane.material.metalnessMap = agape
    this.plane.material.roughnessMap = agape
    this.plane.material.emissive = new Color('#ffffff')
    this.plane.material.emissiveMap = agape
    this.plane.material.emissiveIntensity = 0.5
    // this.plane.material.normalMap = agape
    // this.plane.material.transmissionMap = agape
    // this.plane.material.emissive = new Color('#ffffff')
    this.load = () => {
      // load({ mat: this.plane.material })
    }

    //
    this.core.onClean(() => {
      this.clear()
      this.plane.removeFromParent()
    })
  }
}

let getClothMaterial = ({ sizeX, sizeY, getter, onLoop }) => {
  //
  //
  let mat = new MeshPhysicalMaterial({
    color: '#ffffff',
    side: DoubleSide,
    transparent: true,
    transmission: 1.0,
    metalness: 0.0,
    roughness: 0.0,
    ior: 2.5,
    reflectivity: 0.5,
    thickness: 1,
    envMapIntensity: 1.5,
  })

  ///public/bg/flower@1x.png

  //
  mat.onBeforeCompile = (shader) => {
    //
    shader.uniforms.cloth = {
      get value() {
        return getter()
      },
    }

    onLoop(() => {
      // mat.specularColorMap = getter()
    })

    let atBeginV = `
      uniform sampler2D cloth;
    `

    let transformV3Normal = `
        vec4 nPos = texture2D(cloth, uv);

        float segX = 1.0 / ${sizeX.toFixed(1)};
        float segY = 1.0 / ${sizeY.toFixed(1)};

        vec4 nPosU = texture2D(cloth, vec2(uv.x, uv.y + segY));
        vec4 nPosD = texture2D(cloth, vec2(uv.x, uv.y - segY));

        vec4 nPosL = texture2D(cloth, vec2(uv.x + segX, uv.y));
        vec4 nPosR = texture2D(cloth, vec2(uv.x - segX, uv.y));

        vec3 objectNormal = normalize((
          normalize(nPosU.rgb - nPos.rgb) +
          normalize(nPosD.rgb - nPos.rgb) +
          normalize(nPosL.rgb - nPos.rgb) +
          normalize(nPosR.rgb - nPos.rgb)
        ) / 4.0) ;
      `

    let transformV3 = `
      vec3 transformed = vec3( nPos );
    `

    shader.vertexShader = shader.vertexShader.replace(`void main() {`, `${atBeginV.trim()} void main() {`)

    shader.vertexShader = shader.vertexShader.replace(`#include <begin_vertex>`, `${transformV3}`)

    shader.vertexShader = shader.vertexShader.replace(`#include <beginnormal_vertex>`, `${transformV3Normal}`)

    //
    shader.vertexShader = `${shader.vertexShader.replace(``, ``)}`
    //
  }
  return mat
}

MyCloth.key = md5(Math.random() + fragmentShaderVel + fragmentShaderPos + displayFragment + displayVertex + computeBody)
extend({ MyCloth })

//

//

//

//

//

//
