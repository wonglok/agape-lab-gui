import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import * as THREE from 'three'
import anime from 'animejs'
import { Object3D } from 'three'
import { Box, Environment, OrbitControls, Sphere, TransformControls } from '@react-three/drei'
import { PLYLoader } from 'three-stdlib'

// import { Bloom, EffectComposer } from '@react-three/postprocessing'
// import { MeshBasicMaterial } from 'three147'
// import { BackSide } from 'three'
export function GSplat() {
  return (
    <>
      {/*  */}

      <Canvas>
        <color args={[0x000000]} attach={'background'}></color>
        <OrbitControls makeDefault object-position={[-4, 0.5, -1.5]} target={[0, 0, 0.0]}></OrbitControls>
        <Content></Content>

        <Environment path={'https://lab.agape.land'} files={`/hdr/grass.hdr`}></Environment>
        <directionalLight intensity={3} position={[1, 1, 1]}></directionalLight>

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
  // let controls = useThree((r) => r.controls)
  let ball = useRef()
  let camera = useThree((r) => r.camera)
  return (
    <>
      <Box
        frustumCulled={false}
        position={[0, -1.5, 0]}
        onClick={(ev) => {
          // controls.target.set(ev.point.x, ev.point.y, ev.point.z)

          // anime({
          //   targets: [controls.target, ball.current.position],
          //   x: ev.point.x,
          //   y: ev.point.y,
          //   z: ev.point.z,
          //   duration: 1000,
          //   easing: 'easeOutQuad',
          // })

          window.dispatchEvent(
            new CustomEvent('click-floor', {
              detail: { camera: camera.position, target: ev.point },
            }),
          )
        }}
        args={[500, 0.1, 500, 100, 1, 100]}>
        <meshBasicMaterial color={'#00ff00'} wireframe={true} side={THREE.DoubleSide}></meshBasicMaterial>
      </Box>

      <Sphere scale={0.1} visible={false} ref={ball}></Sphere>
    </>
  )
}
function Content() {
  let [st, setState] = useState(null)

  let camera = useThree((r) => r.camera)
  let controls = useThree((r) => r.controls)
  useEffect(() => {
    if (!camera) {
      return
    }
    if (!controls) {
      return
    }
    let obj = new SPlatMobileClass({ camera, target: controls.target })
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
  }, [camera, controls])

  useFrame(() => {
    if (st?.obj) {
      st.obj.tick()
    }
  })
  return <>{st?.compos}</>
}

class SPlatMobileClass extends Group {
  constructor({ camera, controls }) {
    //
    super()
    this.controls = controls
    let o3 = new Object3D()
    this.add(o3)

    // this.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)))

    this.loadData(`https://huggingface.co/cakewalk/splat-data/resolve/main/train.splat`, camera, o3, controls)
    //
    // this.loadData(`http://localhost:53947/gaussian_splatting_point_cloud.ply`, camera, o3, controls)
  }
  // also works from vanilla three.js
  loadData(src, camera, object, controls) {
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
        const covAndColorData_uint8 = new Uint8Array(covAndColorData.buffer)
        const covAndColorData_int16 = new Int16Array(covAndColorData.buffer)
        for (let i = 0; i < vertexCount; i++) {
          let quat = new THREE.Quaternion(
            (u_buffer[32 * i + 28 + 1] - 128) / 128.0,
            (u_buffer[32 * i + 28 + 2] - 128) / 128.0,
            -(u_buffer[32 * i + 28 + 3] - 128) / 128.0,
            (u_buffer[32 * i + 28 + 0] - 128) / 128.0,
          )
          let center = new THREE.Vector3(f_buffer[8 * i + 0], f_buffer[8 * i + 1], -f_buffer[8 * i + 2])
          let scale = new THREE.Vector3(f_buffer[8 * i + 3 + 0], f_buffer[8 * i + 3 + 1], f_buffer[8 * i + 3 + 2])

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
          centerAndScaleData[destOffset + 1] = center.y
          centerAndScaleData[destOffset + 2] = center.z
          centerAndScaleData[destOffset + 3] = max_value / 32767.0

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

          // Store scale and transparent to remove splat in sorting process
          mtx.elements[15] = (Math.max(scale.x, scale.y, scale.z) * u_buffer[32 * i + 24 + 3]) / 255.0

          for (let j = 0; j < 16; j++) {
            matrices[i * 16 + j] = mtx.elements[j]
          }
        }

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

        const geometry = new THREE.InstancedBufferGeometry().copy(baseGeometry)
        geometry.setAttribute('splatIndex', splatIndexes)
        geometry.instanceCount = vertexCount

        const material = new THREE.ShaderMaterial({
          uniforms: {
            // cameraPosition: { value: new THREE.Vector3() },
            origin: { value: new THREE.Vector3() },
            radius: { value: 50.0 },
            progress: { value: 0.0 },
            time: { value: 0.0 },
            viewport: { value: new Float32Array([1980, 1080]) }, // Dummy. will be overwritten
            focal: { value: 1000.0 }, // Dummy. will be overwritten
            centerAndScaleTexture: { value: centerAndScaleTexture },
            covAndColorTexture: { value: covAndColorTexture },
            gsProjectionMatrix: { value: this.getProjectionMatrix() },
            gsModelViewMatrix: { value: this.getModelViewMatrix() },
          },
          vertexShader: /* glsl */ `
					precision highp usampler2D;


					out vec4 vColor;
					out vec2 vPosition;
					uniform vec2 viewport;
					uniform float focal;
					uniform mat4 gsProjectionMatrix;
					uniform mat4 gsModelViewMatrix;

					attribute uint splatIndex;
					uniform sampler2D centerAndScaleTexture;
					uniform usampler2D covAndColorTexture;

					vec2 unpackInt16(in uint value) {
						int v = int(value);
						int v0 = v >> 16;
						int v1 = (v & 0xFFFF);
						if((v & 0x8000) != 0)
							v1 |= 0xFFFF0000;
						return vec2(float(v1), float(v0));
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


					uniform float time;
					uniform float progress;
					uniform float radius;
					uniform vec3 origin;
          
          uniform sampler2D quatTexture;

					out vec3 vCenter;

					// out float vPerlin;
					out float vDissolveFactor;
          //
          vec3 qtransform( vec4 q, vec3 v ){ 
            return v + 2.0*cross(cross(v, q.xyz ) + q.w*v, q.xyz);
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

					void main () {
            //
            ivec2 texPos = ivec2(splatIndex%uint(1024),splatIndex/uint(1024));
						vec4 quatData = texelFetch(quatTexture, texPos, 0);
						vec4 centerAndScaleData = texelFetch(centerAndScaleTexture, texPos, 0);

						vec4 center = vec4(centerAndScaleData.xyz, 1);

						vec3 startAt = origin.rgb;

						vec3 diff = center.rgb - startAt.rgb;

						float d3 = length(diff.xyz);
						float d2 = length(diff.xz);

						float y = pow(cubicPulse(-0.25 + progress * 1.25, 0.25, d3 / radius), 1.0);

						vCenter = center.xyz;

						// Calculate the distance between the fragment and the camera position
						float distanceFade = distance(startAt, vCenter);

						float dissolveStartDistance = progress * radius + 2.0;
						float dissolveEndDistance = progress * radius - 2.0;

						// Calculate the dissolve factor based on the distance
						float dissolveFactor = smoothstep(dissolveStartDistance, dissolveEndDistance, distanceFade);

						// vPerlin = cnoise(vec3(center.rgb - startAt.rgb) * 0.35);

						// Set the alpha value of the fragment color to the dissolve factor
						vDissolveFactor = dissolveFactor;

            // center.xyz += (1.0 - dissolveFactor) * normalize(center.xyz);
						// vec3 dist = center.xyz - ;
						// vec3 myCenter = center.rgb;
						// float vl = length(myCenter.xyz - origin.xyz);
						// if (vl >= radius) {
						// 	vl = radius;
						// }
						
						// float eH = 3.141592 * 2.0 * (y);
						center.y += 0.3 * cos(vDissolveFactor * 2.0 * 3.141592);
						// vHeight = pow(y, 3.0) * -1.3;

						vec4 camspace = gsModelViewMatrix * center;
						vec4 pos2d = gsProjectionMatrix * camspace;

						// vec4 camspace = modelViewMatrix * vec4(center.x, -center.y, center.z, center.w);
						// vec4 pos2d = projectionMatrix * camspace;

						float bounds = 1.2 * pos2d.w;
						if (pos2d.z < -pos2d.w || pos2d.x < -bounds || pos2d.x > bounds
							|| pos2d.y < -bounds || pos2d.y > bounds) {
							gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
							return;
						}

						uvec4 covAndColorData = texelFetch(covAndColorTexture, texPos, 0);
						vec2 cov3D_M11_M12 = unpackInt16(covAndColorData.x) * centerAndScaleData.w;
						vec2 cov3D_M13_M22 = unpackInt16(covAndColorData.y) * centerAndScaleData.w;
						vec2 cov3D_M23_M33 = unpackInt16(covAndColorData.z) * centerAndScaleData.w;
						mat3 Vrk = mat3(
							cov3D_M11_M12.x, cov3D_M11_M12.y, cov3D_M13_M22.x,
							cov3D_M11_M12.y, cov3D_M13_M22.y, cov3D_M23_M33.x,
							cov3D_M13_M22.x, cov3D_M23_M33.x, cov3D_M23_M33.y
						);

						mat3 J = mat3(
							focal / camspace.z, 0., -(focal * camspace.x) / (camspace.z * camspace.z), 
							0., -focal / camspace.z, (focal * camspace.y) / (camspace.z * camspace.z), 
							0., 0., 0.
						);

						mat3 W = transpose(mat3(gsModelViewMatrix));
						mat3 T = W * J;
						mat3 cov = transpose(T) * Vrk * T;

						vec2 vCenter = vec2(pos2d) / pos2d.w;

						float diagonal1 = cov[0][0] + 0.3;
						float offDiagonal = cov[0][1];
						float diagonal2 = cov[1][1] + 0.3;

						float mid = 0.5 * (diagonal1 + diagonal2);
						float radius = length(vec2((diagonal1 - diagonal2) / 2.0, offDiagonal));
						float lambda1 = mid + radius;
						float lambda2 = max(mid - radius, 0.1);
						vec2 diagonalVector = normalize(vec2(offDiagonal, lambda1 - diagonal1));
						vec2 v1 = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
						vec2 v2 = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);

						uint colorUint = covAndColorData.w;
						vColor = vec4(
							float(colorUint & uint(0xFF)) / 255.0,
							float((colorUint >> uint(8)) & uint(0xFF)) / 255.0,
							float((colorUint >> uint(16)) & uint(0xFF)) / 255.0,
							float(colorUint >> uint(24)) / 255.0
						);
						vPosition = position.xy;
            
            gl_Position = vec4(
							vCenter 
								+ position.x * v2 / viewport * 2.0 
								+ position.y * v1 / viewport * 2.0, pos2d.z / pos2d.w, 1.0);

            // gl_Position = projectionMatrix * modelViewMatrix * vec4(center.rgb + 3.0 * qtransform(quatData, vec3(position.xy * v1 / viewport * 2.0 + position.xy * v2 / viewport * 2.0, position.z)), 1.0);
            
            }
					`,
          fragmentShader: /* glsl */ `
					in vec4 vColor;
					in vec2 vPosition;
					in vec3 vCenter;


					uniform float time;
					uniform float progress;
					uniform vec3 origin;
					uniform float radius;	

					// in float vPerlin;
					in float vDissolveFactor;

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

					void main() {
						
						float A = -dot(vPosition, vPosition);
						if (A < -4.0) discard;
						float B = exp(A) * vColor.a;

						gl_FragColor = vec4(vColor.rgb, B);
						gl_FragColor.a *= vDissolveFactor;

						float dissolveStartDistance = progress * radius - 3.0;
						float dissolveEndDistance = progress * radius + 3.0;

						float distanceFade = distance(origin, vCenter);
						float dissolveFactor = smoothstep(dissolveStartDistance, dissolveEndDistance, distanceFade);

						vec3 add = vec3(0.0);
						if (distanceFade > dissolveStartDistance && distanceFade < dissolveEndDistance) {
							add = vec3(dissolveFactor * (1.0 + dissolveFactor));

							gl_FragColor.rgb = mix(gl_FragColor.rgb, add.rgb * vec3(0.8, 0.3, 0.0) * 3.5, pow(dissolveFactor, 2.0) * 0.5);
						}

            // gl_FragColor = toLinear(gl_FragColor);
            gl_FragColor.a = B * vDissolveFactor;

            // if (gl_FragColor.a <= 0.0001) {
            //   discard;
            // }
          }
				`,
          blending: THREE.CustomBlending,
          blendSrcAlpha: THREE.OneFactor,
          depthTest: true,
          depthWrite: false,
          transparent: true,
          // glslVersion: '300 es',
        })
        let mesh = new THREE.Mesh(geometry, material, vertexCount)
        mesh.frustumCulled = false

        material.onBeforeRender = (renderer, scene, camera, geometry, object, group) => {
          let projectionMatrix = this.getProjectionMatrix(camera)
          mesh.material.uniforms.gsProjectionMatrix.value = projectionMatrix
          mesh.material.uniforms.gsModelViewMatrix.value = this.getModelViewMatrix(camera)

          let viewport = new THREE.Vector4()
          renderer.getCurrentViewport(viewport)
          const focal = (viewport.w / 2.0) * Math.abs(projectionMatrix.elements[5])
          material.uniforms.viewport.value[0] = viewport.z
          material.uniforms.viewport.value[1] = viewport.w
          material.uniforms.focal.value = focal
          material.uniforms.time.value = performance.now() / 1000.0
        }

        material.uniforms.progress.value = 0
        window.addEventListener('click-floor', ({ detail }) => {
          // console.log(detail)

          material.uniforms.origin.value.copy(detail.target)
          // camera.getWorldPosition(material.uniforms.origin.value)
          material.uniforms.progress.value = 0
          material.uniforms.radius.value = 80

          anime({
            targets: [material.uniforms.progress],
            value: 1,
            duration: 300 * material.uniforms.radius.value,
            easing: 'easeOutQuad',
          }).finished.then(() => {
            //
          })
        })

        mesh.frustumCulled = false
        mesh.visible = false
        this.object.add(mesh)

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
    if (this.sortReady) {
      this.sortReady = false

      let camera_mtx = this.getModelViewMatrix().elements
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
    if (!camera) {
      camera = this.camera
    }
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
