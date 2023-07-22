import { Clock, Color, MeshPhysicalMaterial, TextureLoader, Vector2 } from 'three'
import { GPUComputationRenderer } from 'three-stdlib'

export function getWaterSim({ renderer, WIDTH }) {
  // let WIDTH = 128
  // Creates the gpu computation class and sets it up
  let heightMapCode = /* glsl */ `

			#include <common>

			uniform vec3 mousePos;
			uniform float dt;
			uniform float mouseSize;
			uniform float viscosityConstant;
			uniform float heightCompensation;

			void main()	{

				vec2 cellSize = 1.0 / resolution.xy;

				vec2 uv = gl_FragCoord.xy * cellSize;

				// heightmapValue.x == height from previous frame
				// heightmapValue.y == height from penultimate frame
				// heightmapValue.z, heightmapValue.w not used
				vec4 heightmapValue = texture2D( heightmap, uv );

				// Get neighbours
				vec4 north = texture2D( heightmap, uv + vec2( 0.0, cellSize.y ) );
				vec4 south = texture2D( heightmap, uv + vec2( 0.0, - cellSize.y ) );
				vec4 east = texture2D( heightmap, uv + vec2( cellSize.x, 0.0 ) );
				vec4 west = texture2D( heightmap, uv + vec2( - cellSize.x, 0.0 ) );

				// https://web.archive.org/web/20080618181901/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm

				float newHeight = ( ( north.x + south.x + east.x + west.x ) * 0.5 - heightmapValue.y ) * viscosityConstant;

				// Mouse influence
				float mousePhase = clamp( length( ( uv - vec2( 0.5 ) ) * BOUNDS - vec2( mousePos.x, - mousePos.y ) * vec2(BOUNDS, -BOUNDS) ) * PI / mouseSize, 0.0, PI );
				newHeight += ( cos( mousePhase ) + 1.0 ) * dt * 2.5;

				heightmapValue.y = heightmapValue.x;
				heightmapValue.x = newHeight;

				gl_FragColor = heightmapValue;

			}
  `

  let gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer)
  if (renderer.capabilities.isWebGL2 === false) {
    gpuCompute.setDataType(HalfFloatType)
  }

  const heightmap0 = gpuCompute.createTexture()
  let pixels = heightmap0.image.data
  let p = 0
  for (let j = 0; j < WIDTH; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const x = (i * 128) / WIDTH
      const y = (j * 128) / WIDTH

      pixels[p + 0] = 0
      pixels[p + 1] = 0
      pixels[p + 2] = 0
      pixels[p + 3] = 1

      p += 4
    }
  }
  heightmap0.needsUpdate = true
  // fillTexture(heightmap0)

  let heightmapVariable = gpuCompute.addVariable('heightmap', heightMapCode, heightmap0)

  heightmapVariable.material.uniforms['mousePos'] = { value: new Vector2(1000, 1000) }
  heightmapVariable.material.uniforms['dt'] = { value: 1 / 60 }
  heightmapVariable.material.uniforms['mouseSize'] = { value: 15.0 }
  heightmapVariable.material.uniforms['viscosityConstant'] = { value: 0.96 }
  heightmapVariable.material.uniforms['heightCompensation'] = { value: 0 }
  heightmapVariable.material.defines.BOUNDS = WIDTH.toFixed(1)

  gpuCompute.setVariableDependencies(heightmapVariable, [heightmapVariable])

  let displayMaterial = new MeshPhysicalMaterial({
    color: new Color('#ffffff'),
    roughness: 0.0,
    metalness: 0.0,
    transmission: 1,
    thickness: 20.0,
    ior: 2.5,
    reflectivity: 1.5,
    transparent: true,
    //

    // alphaTest: 0.5,
    // alphaMap: new TextureLoader().load(`/pattern/pattern-agape-stp.png`),
  })

  let api = {}
  api.updateMaterial = () => {}
  api.displayMaterial = displayMaterial
  displayMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.heightmap = { value: null }

    api.updateMaterial = () => {
      let tex = gpuCompute.getCurrentRenderTarget(heightmapVariable).texture
      shader.uniforms.heightmap.value = tex
      // // displayMaterial.needsUpdate = true
      // displayMaterial.roughnessMap = tex
      // displayMaterial.metalnessMap = tex
      tex.needsUpdate = true
    }

    shader.vertexShader = shader.vertexShader.replace(
      `void main() {`,
      ` uniform sampler2D heightmap;
        void main() {
      `,
    )

    shader.vertexShader = shader.vertexShader.replace(
      `#include <begin_vertex>`,
      `
        float heightValue = texture2D( heightmap, uv ).x;
        vec3 transformed = vec3( position.x, position.y, position.z + heightValue * 0.25 );

      `,
    )

    shader.vertexShader = shader.vertexShader.replace(
      `#include <beginnormal_vertex>`,
      `

        vec2 cellSize = 1.0 / vec2(${WIDTH.toFixed(1)});
        vec3 objectNormal = vec3(
            ( texture2D( heightmap, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( heightmap, uv + vec2( cellSize.x, 0 ) ).x ),
            ( texture2D( heightmap, uv + vec2( 0, - cellSize.y ) ).x - texture2D( heightmap, uv + vec2( 0, cellSize.y ) ).x ),
            1.0 );
      `,
    )

    //
  }

  const error = gpuCompute.init()
  if (error !== null) {
    console.error(error)
  }

  let clock = new Clock()
  api.compute = () => {
    gpuCompute.compute()
    let dt = clock.getDelta()

    if (dt >= 1 / 30) {
      dt = 1 / 30
    }
    heightmapVariable.material.uniforms['dt'].value = dt
  }

  api.updateMouse = (x, y, z) => {
    heightmapVariable.material.uniforms['mousePos'].value.set(x, y, z)
  }

  api.getHeightMap = () => {
    return gpuCompute.getCurrentRenderTarget(heightmapVariable).texture
  }

  // api.displayMaterial
  // api.updateMaterial

  return api
}
