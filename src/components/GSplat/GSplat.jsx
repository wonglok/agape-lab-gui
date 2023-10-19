import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group } from 'three'
import * as THREE from 'three'
import anime from 'animejs'
import { MeshBVH, INTERSECTED, NOT_INTERSECTED, CONTAINED } from 'three-mesh-bvh'
import { Object3D } from 'three'
import { Box, Environment, OrbitControls, PerspectiveCamera, Sphere, TransformControls } from '@react-three/drei'
import { Vector2 } from 'three'
import { DataUtils } from 'three'
import MyWorker from './my.worker.js'

// import { Bloom, EffectComposer } from '@react-three/postprocessing'
// import { MeshBasicMaterial } from 'three147'
// import { BackSide } from 'three'
export function GSplat() {
  return (
    <>
      {/*  */}

      <Canvas>
        <color args={[0x000000]} attach={'background'}></color>
        <PerspectiveCamera near={0.05} far={500} fov={56} makeDefault></PerspectiveCamera>
        {/*  */}
        <OrbitControls makeDefault object-position={[-4, 0.5, -1.5]} target={[-2, 0, 0.0]}></OrbitControls>

        {/* <Environment files={`/hdr/grass.hdr`}></Environment> */}

        <></>
        {/* <EffectComposer multisampling={0} disableNormalPass>
          <Bloom luminanceThreshold={1} intensity={1} mipmapBlur></Bloom>
        </EffectComposer> */}

        <Focus></Focus>
      </Canvas>

      {/*  */}
    </>
  )
}

function Focus() {
  let camera = useThree((r) => r.camera)
  let lightRef = useRef()
  let flatCursor = useRef()
  let tv = new THREE.Vector3()
  useEffect(() => {
    window.addEventListener('light', ({ detail }) => {
      if (lightRef.current) {
        lightRef.current.position.copy(detail.lightPosition)
      }
    })
  })

  return (
    <>
      {/* <Sphere scale={[0.1, 0.2, 0.1]} ref={ball} args={[1, 4, 2]}>
        <meshBasicMaterial color={'#ff0000'} wireframe></meshBasicMaterial>
      </Sphere> */}
      <pointLight color={`#ffffff`} intensity={5} visible={true} ref={lightRef}></pointLight>

      {/* <ambientLight intensity={1} /> */}

      {/* <pointLight visible={true} ref={light} position={[0, 0, 0]} intensity={1} distance={3}></pointLight> */}

      <group>
        <Content></Content>
      </group>
    </>
  )
}
function Content() {
  let [st, setState] = useState(null)

  let mouse = useThree((r) => r.mouse)
  let camera = useThree((r) => r.camera)
  let controls = useThree((r) => r.controls)
  useEffect(() => {
    if (!camera) {
      return
    }
    if (!controls) {
      return
    }
    let obj = new SPlatMobileClass({ camera, target: controls.target, mouse })
    setState({
      obj,
      compos: (
        <>
          <group quaternion={[0.045377556852419475, 0.002883670468155779, -0.02352204538395564, 0.9986887779281849]}>
            <primitive object={obj} />
          </group>

          {/* <TransformControls
            mode='rotate'
            onChange={(ev) => {
              console.log(ev.target.worldQuaternion.toArray())
            }}></TransformControls> */}
        </>
      ),
    })
  }, [camera, mouse, controls])

  useFrame(() => {
    if (st?.obj) {
      st.obj.tick()
    }
  })
  return <>{st?.compos}</>
}

class SPlatMobileClass extends Group {
  constructor({ camera, controls, mouse }) {
    //
    super()
    this.mouse = mouse
    this.controls = controls
    let o3 = new Object3D()
    this.add(o3)

    // this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)))

    this.loadData(`https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat`, camera, o3, controls, mouse)
    //
  }
  // also works from vanilla three.js
  loadData(src, camera, object, controls, mouse) {
    this.src = src
    this.camera = camera
    this.object = object

    fetch(src)
      .then(async (data) => {
        const reader = data.body.getReader()

        let bytesDownloaded = 0
        let _totalDownloadBytes = data.headers.get('Content-Length')
        let totalDownloadBytes = _totalDownloadBytes ? parseInt(_totalDownloadBytes) : undefined

        const chunks = []
        const start = Date.now()
        let lastReportedProgress = 0

        while (true) {
          try {
            const { value, done } = await reader.read()
            if (done) {
              console.log('Completed download.')
              break
            }
            bytesDownloaded += value.length
            if (totalDownloadBytes != undefined) {
              const mbps = bytesDownloaded / 1024 / 1024 / ((Date.now() - start) / 1000)
              const percent = (bytesDownloaded / totalDownloadBytes) * 100
              if (percent - lastReportedProgress > 1) {
                console.log('download progress:', percent.toFixed(2) + '%', mbps.toFixed(2) + ' Mbps')
                lastReportedProgress = percent
              }
            } else {
              console.log('download progress:', bytesDownloaded, ', unknown total')
            }
            chunks.push(value)
          } catch (error) {
            console.error(error)
            success = false
            break
          }
        }

        // Concatenate the chunks into a single Uint8Array
        const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          concatenatedChunks.set(chunk, offset)
          offset += chunk.length
        }

        return concatenatedChunks.buffer
      })
      .then((buffer) => {
        let u_buffer = new Uint8Array(buffer)
        if (u_buffer[0] == 112 && u_buffer[1] == 108 && u_buffer[2] == 121 && u_buffer[3] == 10) {
          buffer = this.processPlyBuffer(buffer)
          u_buffer = new Uint8Array(buffer)
        }

        const rowLength = 3 * 4 + 3 * 4 + 4 + 4
        let vertexCount = Math.floor(buffer.byteLength / rowLength)
        let f_buffer = new Float32Array(buffer)

        if (vertexCount > 1024 * 1024) {
          console.log('vertexCount limited to 1024*1024', vertexCount)
          vertexCount = 1024 * 1024
        }

        //
        let matrices = new Float32Array(vertexCount * 16)
        const centerAndScaleData = new Float32Array(1024 * 1024 * 4)
        const covAndColorData = new Uint32Array(1024 * 1024 * 4)

        const quatData = new Uint16Array(1024 * 1024 * 4)
        const scaleData = new Uint16Array(1024 * 1024 * 4)
        const colorData = new Uint16Array(1024 * 1024 * 4)

        const covAndColorData_uint8 = new Uint8Array(covAndColorData.buffer)
        const covAndColorData_int16 = new Int16Array(covAndColorData.buffer)

        let pointCloudGeo = new THREE.BufferGeometry()
        pointCloudGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3))
        let indices = []
        for (let i = 0; i < vertexCount; i++) {
          let quat = new THREE.Quaternion(
            (u_buffer[32 * i + 28 + 1] - 128) / 128.0,
            (u_buffer[32 * i + 28 + 2] - 128) / 128.0,
            -(u_buffer[32 * i + 28 + 3] - 128) / 128.0,
            (u_buffer[32 * i + 28 + 0] - 128) / 128.0,
          )

          quatData[i * 4 + 0] = DataUtils.toHalfFloat(quat.x)
          quatData[i * 4 + 1] = DataUtils.toHalfFloat(quat.y)
          quatData[i * 4 + 2] = DataUtils.toHalfFloat(quat.z)
          quatData[i * 4 + 3] = DataUtils.toHalfFloat(quat.w)

          let center = new THREE.Vector3(f_buffer[8 * i + 0], f_buffer[8 * i + 1], -f_buffer[8 * i + 2])
          let scale = new THREE.Vector3(f_buffer[8 * i + 3 + 0], f_buffer[8 * i + 3 + 1], f_buffer[8 * i + 3 + 2])

          scaleData[i * 4 + 0] = DataUtils.toHalfFloat(scale.x)
          scaleData[i * 4 + 1] = DataUtils.toHalfFloat(scale.y)
          scaleData[i * 4 + 2] = DataUtils.toHalfFloat(scale.z)
          scaleData[i * 4 + 3] = DataUtils.toHalfFloat(1.0)

          let mtx = new THREE.Matrix4()
          mtx.makeRotationFromQuaternion(quat)
          mtx.transpose()
          mtx.scale(scale)
          let mtx_t = mtx.clone()
          mtx.transpose()
          mtx.premultiply(mtx_t)
          mtx.setPosition(center)

          let cov_indexes = [0, 1, 2, 5, 6, 10]
          let max_value = 0.0
          for (let j = 0; j < cov_indexes.length; j++) {
            if (Math.abs(mtx.elements[cov_indexes[j]]) > max_value) {
              max_value = Math.abs(mtx.elements[cov_indexes[j]])
            }
          }

          let destOffset = i * 4
          centerAndScaleData[destOffset + 0] = center.x
          centerAndScaleData[destOffset + 1] = -center.y
          centerAndScaleData[destOffset + 2] = center.z
          centerAndScaleData[destOffset + 3] = max_value / 32767.0

          pointCloudGeo.attributes.position.setXYZ(i, center.x, center.y, center.z)
          indices.push(i, i, i)

          destOffset = i * 4 * 2
          for (let j = 0; j < cov_indexes.length; j++) {
            covAndColorData_int16[destOffset + j] = parseInt((mtx.elements[cov_indexes[j]] * 32767.0) / max_value)
          }

          // RGBA
          destOffset = (i * 4 + 3) * 4
          covAndColorData_uint8[destOffset + 0] = u_buffer[32 * i + 24 + 0]
          covAndColorData_uint8[destOffset + 1] = u_buffer[32 * i + 24 + 1]
          covAndColorData_uint8[destOffset + 2] = u_buffer[32 * i + 24 + 2]
          covAndColorData_uint8[destOffset + 3] = u_buffer[32 * i + 24 + 3]

          //
          colorData[i * 4 + 0] = DataUtils.toHalfFloat(u_buffer[32 * i + 24 + 0] / 255.0)
          colorData[i * 4 + 1] = DataUtils.toHalfFloat(u_buffer[32 * i + 24 + 1] / 255.0)
          colorData[i * 4 + 2] = DataUtils.toHalfFloat(u_buffer[32 * i + 24 + 2] / 255.0)
          colorData[i * 4 + 3] = DataUtils.toHalfFloat(u_buffer[32 * i + 24 + 3] / 255.0)

          // Store scale and transparent to remove splat in sorting process
          mtx.elements[15] = (Math.max(scale.x, scale.y, scale.z) * u_buffer[32 * i + 24 + 3]) / 255.0

          for (let j = 0; j < 16; j++) {
            matrices[i * 16 + j] = mtx.elements[j]
          }
        }
        pointCloudGeo.setIndex(indices)
        // let bvh = new MeshBVH(pointCloudGeo, { lazyGeneration: false })

        // this.bvh = bvh

        // let raycaster = new THREE.Raycaster()
        // let dir = new THREE.Vector3()

        // let dest = new THREE.Vector3()
        // setInterval(() => {
        //   let closestDistance = Infinity
        //   camera.getWorldDirection(dir)

        //   // console.log(mouse)
        //   raycaster.setFromCamera(mouse, camera)
        //   let ray = raycaster.ray

        //   //

        //   dest.set(0, 0, 0)
        //   const localThreshold = 2

        //   let currentDist = Infinity
        //   bvh.shapecast({
        //     boundsTraverseOrder: (box) => {
        //       // traverse the closer bounds first.
        //       return box.distanceToPoint(ray.origin)
        //     },
        //     intersectsBounds: (box, isLeaf, score) => {
        //       // if we've already found a point that's closer then the full bounds then
        //       // don't traverse further.
        //       if (score > closestDistance) {
        //         return NOT_INTERSECTED
        //       }

        //       box.expandByScalar(localThreshold)
        //       return ray.intersectsBox(box) ? INTERSECTED : NOT_INTERSECTED
        //     },
        //     intersectsTriangle: (triangle) => {
        //       let dist = ray.distanceToPoint(triangle.a)
        //       if (dist < currentDist) {
        //         currentDist = dist
        //         dest.copy(triangle.a)
        //       }
        //     },
        //   })

        //   console.log(dest.length())

        //   if (dest.length() === 0.0) {
        //     return
        //   }
        //   window.dispatchEvent(new CustomEvent('light', { detail: { lightPosition: dest } }))
        //   //
        // })

        this.myWorker = new MyWorker()
        let canFire = true
        this.myWorker.onmessage = ({ data }) => {
          if (data.type === 'raycast') {
            canFire = true
            window.dispatchEvent(new CustomEvent('light', { detail: { lightPosition: data.point } }))
          }
        }

        setInterval(() => {
          if (!canFire) {
            return
          }
          canFire = false
          this.myWorker.postMessage({ mouse, camera: camera.toJSON() })
        })
        this.myWorker.postMessage({ bvhGeo: pointCloudGeo })

        const centerAndScaleTexture = new THREE.DataTexture(centerAndScaleData, 1024, 1024, THREE.RGBA, THREE.FloatType)
        centerAndScaleTexture.needsUpdate = true
        const covAndColorTexture = new THREE.DataTexture(
          covAndColorData,
          1024,
          1024,
          THREE.RGBAIntegerFormat,
          THREE.UnsignedIntType,
        )
        covAndColorTexture.internalFormat = 'RGBA32UI'
        covAndColorTexture.needsUpdate = true

        let splatIndexArray = new Uint32Array(vertexCount)
        const splatIndexes = new THREE.InstancedBufferAttribute(splatIndexArray, 1, false)
        splatIndexes.setUsage(THREE.DynamicDrawUsage)

        const baseGeometry = new THREE.BufferGeometry()
        const positionsArray = new Float32Array(6 * 3)
        const positions = new THREE.BufferAttribute(positionsArray, 3)
        baseGeometry.setAttribute('position', positions)
        positions.setXYZ(2, -2.0, 2.0, 0.0)
        positions.setXYZ(1, 2.0, 2.0, 0.0)
        positions.setXYZ(0, -2.0, -2.0, 0.0)
        positions.setXYZ(5, -2.0, -2.0, 0.0)
        positions.setXYZ(4, 2.0, 2.0, 0.0)
        positions.setXYZ(3, 2.0, -2.0, 0.0)
        positions.needsUpdate = true

        let pl = new THREE.BufferGeometry()
        {
          // Define the vertices of the triangle
          const vertices = new Float32Array([
            -0.5,
            -0.2887,
            0, // bottom left
            0.5,
            -0.2887,
            0, // bottom right
            0,
            0.5774,
            0, // top
          ])

          // Define the UV coordinates of the triangle
          const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1])

          // Define the indices of the triangle
          const indices = new Uint16Array([0, 1, 2])

          // Create a buffer geometry
          const triangleGeometry = new THREE.BufferGeometry()
          triangleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
          triangleGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
          triangleGeometry.setIndex(new THREE.BufferAttribute(indices, 1))

          // compute the face normals
          triangleGeometry.computeVertexNormals()

          pl.copy(triangleGeometry)
          pl.scale(7, 7, 7)
          pl.center()
        }

        const geometry = new THREE.InstancedBufferGeometry().copy(pl)
        geometry.setAttribute('splatIndex', splatIndexes)
        geometry.instanceCount = vertexCount

        let mesh = new THREE.Mesh(geometry)
        pl.setAttribute('splatIndex', splatIndexes)
        mesh.frustumCulled = false

        // material.uniforms.progress.value = 0

        mesh.frustumCulled = false
        mesh.visible = false
        this.object.add(mesh)

        let stdMat = new THREE.MeshLambertMaterial({
          blending: THREE.CustomBlending,
          blendSrcAlpha: THREE.OneFactor,
          depthTest: false,
          depthWrite: false,
          transparent: true,
          side: THREE.DoubleSide,
          metalness: 0.0,
          roughness: 1.0,
          premultipliedAlpha: true,
          precision: 'lowp',
          // color: new THREE.Color('#000000'),
          // emissive: new THREE.Color('#000000'),
        })
        stdMat.onBeforeCompile = (shader) => {
          let quatTexture = new THREE.DataTexture(quatData, 1024, 1024, THREE.RGBAFormat, THREE.HalfFloatType)
          quatTexture.needsUpdate = true

          let colorTexture = new THREE.DataTexture(colorData, 1024, 1024, THREE.RGBAFormat, THREE.HalfFloatType)
          colorTexture.needsUpdate = true

          let scaleTexture = new THREE.DataTexture(scaleData, 1024, 1024, THREE.RGBAFormat, THREE.HalfFloatType)
          scaleTexture.needsUpdate = true

          shader.uniforms.scaleTexture = { value: scaleTexture }
          shader.uniforms.quatTexture = { value: quatTexture }
          shader.uniforms.centerAndScaleTexture = { value: centerAndScaleTexture }
          shader.uniforms.colorTexture = { value: colorTexture }
          shader.uniforms.splatScale = { value: 1 }
          shader.uniforms.progress = { value: 1.0 }
          shader.uniforms.radius = { value: 80 }
          shader.uniforms.origin = { value: new THREE.Vector3() }

          window.addEventListener('click-floor', ({ detail }) => {
            //

            camera.getWorldPosition(shader.uniforms.origin.value)
            shader.uniforms.progress.value = 0
            shader.uniforms.radius.value = 80

            shader.uniforms.origin.value.copy(detail.target)
            anime({
              targets: [shader.uniforms.progress],
              value: 1,
              duration: 300 * shader.uniforms.radius.value,
              easing: 'easeOutQuad',
            }).finished.then(() => {
              //
            })
          })

          let headersVS = `
          
            attribute uint splatIndex;
          uniform sampler2D centerAndScaleTexture;
          uniform sampler2D quatTexture;
          uniform sampler2D colorTexture;
          uniform sampler2D scaleTexture;
          uniform float splatScale;
          varying vec4 v_Color;
          varying vec2 v_UV;
          varying float v_DissolveFactor;
          uniform vec3 origin;
          uniform float radius;
          uniform float progress;
          
          vec3 qtransform( vec4 q, vec3 v ){ 
            return v + 2.0*cross(cross(v, q.xyz ) + q.w*v, q.xyz);
          } 
          
          mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
            vec3 rr = vec3(sin(roll), cos(roll), 0.0);
            vec3 ww = normalize(target - origin);
            vec3 uu = normalize(cross(ww, rr));
            vec3 vv = normalize(cross(uu, ww));

            return mat3(uu, vv, ww);
          }

          mat4 rotationX( in float angle ) {
							return mat4(	1.0,		0,			0,			0,
											0, 	cos(angle),	-sin(angle),		0,
											0, 	sin(angle),	 cos(angle),		0,
											0, 			0,			  0, 		1);
						}

          mat4 rotationY( in float angle ) {
            return mat4(	cos(angle),		0,		sin(angle),	0,
                        0,		1.0,			 0,	0,
                    -sin(angle),	0,		cos(angle),	0,
                        0, 		0,				0,	1);
          }

          mat4 rotationZ( in float angle ) {
            return mat4(	cos(angle),		-sin(angle),	0,	0,
                    sin(angle),		cos(angle),		0,	0,
                        0,				0,		1,	0,
                        0,				0,		0,	1);
          }


					//  Function from Iñigo Quiles
					//  www.iquilezles.org/www/articles/functions/functions.htm
					float cubicPulse( float c, float w, float x ){
							x = abs(x - c);
							if( x>w ) return 0.0;
							x /= w;
							return 1.0 - x*x*(3.0-2.0*x);
					}


          //	Classic Perlin 3D Noise
          //	by Stefan Gustavson
          //
          vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
          vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
          vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

          float cnoise(vec3 P){
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
            return 2.2 * n_xyz;
          }



          `

          let beginVS = `
          
            ivec2 texPos = ivec2(splatIndex%uint(1024),splatIndex/uint(1024));
						vec4 centerAndScaleData = texelFetch(centerAndScaleTexture, texPos, 0);
						vec4 center = vec4(centerAndScaleData.xyz, 1);

            vec4 quatData = texelFetch(quatTexture, texPos, 0);
            vec4 colorData = texelFetch(colorTexture, texPos, 0);
            vec4 scaleData = texelFetch(scaleTexture, texPos, 0);

            v_Color = colorData;
            v_UV = uv;

            vec4 camspace = modelViewMatrix * center;
						vec4 pos2d = projectionMatrix * camspace;

						// float bounds = 1.2 * pos2d.w;
						// if (pos2d.z < -pos2d.w || pos2d.x < -bounds || pos2d.x > bounds
						// 	|| pos2d.y < -bounds || pos2d.y > bounds) {
						// 	gl_Position = vec4(0.0, 0.0, 0.0, -1.0);
						// 	return;
						// }

            vec3 startAt = origin.rgb;

						vec3 diff = center.rgb - startAt.rgb;

						float d3 = length(diff.xyz);
						float d2 = length(diff.xz);

						float y = pow(cubicPulse(-0.25 + progress * 1.25, 0.25, d3 / radius), 1.0);

						// Calculate the distance between the fragment and the camera position
						float distanceFade = distance(startAt, center.rgb);

						float dissolveStartDistance = progress * radius + 2.0;
						float dissolveEndDistance = progress * radius - 2.0;

						// Calculate the dissolve factor based on the distance
						float dissolveFactor = smoothstep(dissolveStartDistance, dissolveEndDistance, distanceFade);

						float sPerlin = cnoise(vec3(center.rgb - startAt.rgb) * 0.35);

						// Set the alpha value of the fragment color to the dissolve factor
						v_DissolveFactor = dissolveFactor;

            vec3 splatGeo = vec3(scaleData.rgb * splatScale * position);
            transformed.rgb = center.rgb + qtransform(quatData, splatGeo.rgb); 

          `

          let headerFS = `
  
            varying vec4 v_Color;
          varying float v_DissolveFactor;
          varying vec2 v_UV;

           // Converts a color from linear light gamma to sRGB gamma
          vec4 fromLinear(vec4 linearRGB)
          {
              bvec4 cutoff = lessThan(linearRGB, vec4(0.0031308));
              vec4 higher = vec4(1.055)*pow(linearRGB, vec4(1.0/2.4)) - vec4(0.055);
              vec4 lower = linearRGB * vec4(12.92);

              return mix(higher, lower, cutoff);
          }

          // Converts a color from sRGB gamma to linear light gamma
          vec4 toLinear(vec4 sRGB)
          {
              bvec4 cutoff = lessThan(sRGB, vec4(0.04045));
              vec4 higher = pow((sRGB + vec4(0.055))/vec4(1.055), vec4(2.4));
              vec4 lower = sRGB/vec4(12.92);

              return mix(higher, lower, cutoff);
          }

  `
          let colorFS = `
  diffuseColor.rgb = toLinear(v_Color.rgba).rgb;
  `

          let alpahFS = `
  //  gl_FragColor.a = ((0.5 - length(v_UV.xy - 0.5))) * 0.5 * opacity * v_DissolveFactor;
  
   gl_FragColor.a = ((0.5 - length(v_UV.xy - 0.5))) * 0.5 * opacity;
  `

          shader.vertexShader = `

          #define LAMBERT


varying vec3 vViewPosition;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


          ${headersVS}


void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>

  ${beginVS}

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}



          `

          shader.fragmentShader = `

#define LAMBERT

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

${headerFS}

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
  ${colorFS}


	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

  ${alpahFS}

}

          `
        }
        mesh.material = stdMat
        //

        this.worker = new Worker(
          URL.createObjectURL(
            new Blob(
              [
                /* javascript */ `
                  let matrices


                  const sortSplats = function sortSplats(matrices, view) {
                    const vertexCount = matrices.length / 16
                    let threshold = -0.001

                    let maxDepth = -Infinity
                    let minDepth = Infinity
                    let depthList = new Float32Array(vertexCount)
                    let sizeList = new Int32Array(depthList.buffer)
                    let validIndexList = new Int32Array(vertexCount)
                    let validCount = 0
                    for (let i = 0; i < vertexCount; i++) {
                      // Sign of depth is reversed
                      let depth = view[0] * matrices[i * 16 + 12] + view[1] * matrices[i * 16 + 13] + view[2] * matrices[i * 16 + 14] + view[3]

                      // Skip behind of camera and small, transparent splat
                      if (depth < 0 && matrices[i * 16 + 15] > threshold * depth) {
                        depthList[validCount] = depth
                        validIndexList[validCount] = i
                        validCount++
                        if (depth > maxDepth) maxDepth = depth
                        if (depth < minDepth) minDepth = depth
                      }
                    }

                    // This is a 16 bit single-pass counting sort
                    let depthInv = (256 * 256 - 1) / (maxDepth - minDepth)
                    let counts0 = new Uint32Array(256 * 256)
                    for (let i = 0; i < validCount; i++) {
                      sizeList[i] = ((depthList[i] - minDepth) * depthInv) | 0
                      counts0[sizeList[i]]++
                    }
                    let starts0 = new Uint32Array(256 * 256)
                    for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1]
                    let depthIndex = new Uint32Array(validCount)
                    for (let i = 0; i < validCount; i++) depthIndex[starts0[sizeList[i]]++] = validIndexList[i]

                    return depthIndex
                  }

                  self.onmessage = (e) => {

                    // console.log(e);
                    if (e.data.matrices) {
                      matrices = new Float32Array(e.data.matrices)
                    }
                    if (e.data.view) {
                      const view = new Float32Array(e.data.view)
                      const sortedIndexes = sortSplats(matrices, view)
                      self.postMessage({ sortedIndexes }, [sortedIndexes.buffer])
                    }
                  }
                `,
              ],
              {
                type: 'application/javascript',
              },
            ),
          ),
        )

        this.worker.postMessage(
          {
            matrices: matrices.buffer,
          },
          [matrices.buffer],
        )

        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('click-floor', {
              detail: { camera: new THREE.Vector3(0, 0, 0), target: new THREE.Vector3(0, 0, 0) },
            }),
          )
        }, 1000)

        // let frustum = new THREE.Frustum()

        // this.onTickCast = () => {
        //   frustum.setFromProjectionMatrix(
        //     new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
        //   )

        //   let indicues = []
        //   let center = new THREE.Vector3()
        //   bvh.shapecast({
        //     intersectsBounds: (box, isLeaf, score, depth, nodeIndex) => {
        //       if (frustum.intersectsBox(box)) {
        //         return INTERSECTED
        //       }
        //       box.getCenter(center)
        //       if (frustum.containsPoint(center)) {
        //         return CONTAINED
        //       }
        //       return NOT_INTERSECTED
        //     },
        //     intersectsTriangle: (triangle, triangleIndex, contained, depth) => {
        //       //
        //       indicues.push(triangleIndex)
        //     },
        //   })
        //   splatIndexes.array.set(new Uint32Array(indicues))
        //   splatIndexes.needsUpdate = true
        //   mesh.geometry.instanceCount = indicues.length

        //   console.log(indicues.length)
        // }

        this.worker.onmessage = (e) => {
          let indexes = new Uint32Array(e.data.sortedIndexes)
          mesh.geometry.attributes.splatIndex.set(indexes)
          mesh.geometry.attributes.splatIndex.needsUpdate = true
          mesh.geometry.instanceCount = indexes.length
          this.sortReady = true
          mesh.visible = true
        }
        this.sortReady = true
      })
  }
  tick(time, timeDelta) {
    // if (this.onTickCast) {
    //   this.onTickCast()
    // }
    if (this.sortReady) {
      this.sortReady = false
      let camera_mtx = this.getModelViewMatrix(this.camera).elements
      let view = new Float32Array([camera_mtx[2], camera_mtx[6], camera_mtx[10], camera_mtx[14]])
      this.worker.postMessage({ view }, [view.buffer])
    }
  }
  getProjectionMatrix(camera) {
    if (!camera) {
      camera = this.camera
    }
    let mtx = camera.projectionMatrix.clone()
    mtx.elements[4] *= -1
    mtx.elements[5] *= -1
    mtx.elements[6] *= -1
    mtx.elements[7] *= -1
    return mtx
  }
  getModelViewMatrix(camera) {
    const viewMatrix = camera.matrixWorld.clone()
    viewMatrix.elements[1] *= -1.0
    viewMatrix.elements[4] *= -1.0
    viewMatrix.elements[6] *= -1.0
    viewMatrix.elements[9] *= -1.0
    viewMatrix.elements[13] *= -1.0
    const mtx = this.object.matrixWorld.clone()
    mtx.invert()
    mtx.elements[1] *= -1.0
    mtx.elements[4] *= -1.0
    mtx.elements[6] *= -1.0
    mtx.elements[9] *= -1.0
    mtx.elements[13] *= -1.0
    mtx.multiply(viewMatrix)
    mtx.invert()
    return mtx
  }
  createWorker(self) {
    let matrices

    const sortSplats = function sortSplats(matrices, view) {
      const vertexCount = matrices.length / 16
      let threshold = -0.001

      let maxDepth = -Infinity
      let minDepth = Infinity
      let depthList = new Float32Array(vertexCount)
      let sizeList = new Int32Array(depthList.buffer)
      let validIndexList = new Int32Array(vertexCount)
      let validCount = 0
      for (let i = 0; i < vertexCount; i++) {
        // Sign of depth is reversed
        let depth =
          view[0] * matrices[i * 16 + 12] + view[1] * matrices[i * 16 + 13] + view[2] * matrices[i * 16 + 14] + view[3]

        // Skip behind of camera and small, transparent splat
        if (depth < 0 && matrices[i * 16 + 15] > threshold * depth) {
          depthList[validCount] = depth
          validIndexList[validCount] = i
          validCount++
          if (depth > maxDepth) maxDepth = depth
          if (depth < minDepth) minDepth = depth
        }
      }

      // This is a 16 bit single-pass counting sort
      let depthInv = (256 * 256 - 1) / (maxDepth - minDepth)
      let counts0 = new Uint32Array(256 * 256)
      for (let i = 0; i < validCount; i++) {
        sizeList[i] = ((depthList[i] - minDepth) * depthInv) | 0
        counts0[sizeList[i]]++
      }
      let starts0 = new Uint32Array(256 * 256)
      for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1]
      let depthIndex = new Uint32Array(validCount)
      for (let i = 0; i < validCount; i++) depthIndex[starts0[sizeList[i]]++] = validIndexList[i]

      return depthIndex
    }

    self.onmessage = (e) => {
      if (e.data.matrices) {
        matrices = new Float32Array(e.data.matrices)
      }
      if (e.data.view) {
        const view = new Float32Array(e.data.view)
        const sortedIndexes = sortSplats(matrices, view)
        self.postMessage({ sortedIndexes }, [sortedIndexes.buffer])
      }
    }
  }
  processPlyBuffer(inputBuffer) {
    const ubuf = new Uint8Array(inputBuffer)
    // 10KB ought to be enough for a header...
    const header = new TextDecoder().decode(ubuf.slice(0, 1024 * 10))
    const header_end = 'end_header\n'
    const header_end_index = header.indexOf(header_end)
    if (header_end_index < 0) throw new Error('Unable to read .ply file header')
    const vertexCount = parseInt(/element vertex (\d+)\n/.exec(header)[1])
    console.log('Vertex Count', vertexCount)
    let row_offset = 0,
      offsets = {},
      types = {}
    const TYPE_MAP = {
      double: 'getFloat64',
      int: 'getInt32',
      uint: 'getUint32',
      float: 'getFloat32',
      short: 'getInt16',
      ushort: 'getUint16',
      uchar: 'getUint8',
    }
    for (let prop of header
      .slice(0, header_end_index)
      .split('\n')
      .filter((k) => k.startsWith('property '))) {
      const [p, type, name] = prop.split(' ')
      const arrayType = TYPE_MAP[type] || 'getInt8'
      types[name] = arrayType
      offsets[name] = row_offset
      row_offset += parseInt(arrayType.replace(/[^\d]/g, '')) / 8
    }
    console.log('Bytes per row', row_offset, types, offsets)

    let dataView = new DataView(inputBuffer, header_end_index + header_end.length)
    let row = 0
    const attrs = new Proxy(
      {},
      {
        get(target, prop) {
          if (!types[prop]) throw new Error(prop + ' not found')
          return dataView[types[prop]](row * row_offset + offsets[prop], true)
        },
      },
    )

    console.time('calculate importance')
    let sizeList = new Float32Array(vertexCount)
    let sizeIndex = new Uint32Array(vertexCount)
    for (row = 0; row < vertexCount; row++) {
      sizeIndex[row] = row
      if (!types['scale_0']) continue
      const size = Math.exp(attrs.scale_0) * Math.exp(attrs.scale_1) * Math.exp(attrs.scale_2)
      const opacity = 1 / (1 + Math.exp(-attrs.opacity))
      sizeList[row] = size * opacity
    }
    console.timeEnd('calculate importance')

    console.time('sort')
    sizeIndex.sort((b, a) => sizeList[a] - sizeList[b])
    console.timeEnd('sort')

    // 6*4 + 4 + 4 = 8*4
    // XYZ - Position (Float32)
    // XYZ - Scale (Float32)
    // RGBA - colors (uint8)
    // IJKL - quaternion/rot (uint8)
    const rowLength = 3 * 4 + 3 * 4 + 4 + 4
    const buffer = new ArrayBuffer(rowLength * vertexCount)

    console.time('build buffer')
    for (let j = 0; j < vertexCount; j++) {
      row = sizeIndex[j]

      const position = new Float32Array(buffer, j * rowLength, 3)
      const scales = new Float32Array(buffer, j * rowLength + 4 * 3, 3)
      const rgba = new Uint8ClampedArray(buffer, j * rowLength + 4 * 3 + 4 * 3, 4)
      const rot = new Uint8ClampedArray(buffer, j * rowLength + 4 * 3 + 4 * 3 + 4, 4)

      if (types['scale_0']) {
        const qlen = Math.sqrt(attrs.rot_0 ** 2 + attrs.rot_1 ** 2 + attrs.rot_2 ** 2 + attrs.rot_3 ** 2)

        rot[0] = (attrs.rot_0 / qlen) * 128 + 128
        rot[1] = (attrs.rot_1 / qlen) * 128 + 128
        rot[2] = (attrs.rot_2 / qlen) * 128 + 128
        rot[3] = (attrs.rot_3 / qlen) * 128 + 128

        scales[0] = Math.exp(attrs.scale_0)
        scales[1] = Math.exp(attrs.scale_1)
        scales[2] = Math.exp(attrs.scale_2)
      } else {
        scales[0] = 0.01
        scales[1] = 0.01
        scales[2] = 0.01

        rot[0] = 255
        rot[1] = 0
        rot[2] = 0
        rot[3] = 0
      }

      position[0] = attrs.x
      position[1] = attrs.y
      position[2] = attrs.z

      if (types['f_dc_0']) {
        const SH_C0 = 0.28209479177387814
        rgba[0] = (0.5 + SH_C0 * attrs.f_dc_0) * 255
        rgba[1] = (0.5 + SH_C0 * attrs.f_dc_1) * 255
        rgba[2] = (0.5 + SH_C0 * attrs.f_dc_2) * 255
      } else {
        rgba[0] = attrs.red
        rgba[1] = attrs.green
        rgba[2] = attrs.blue
      }
      if (types['opacity']) {
        rgba[3] = (1 / (1 + Math.exp(-attrs.opacity))) * 255
      } else {
        rgba[3] = 255
      }
    }
    console.timeEnd('build buffer')
    return buffer
  }
}

/*
 */
