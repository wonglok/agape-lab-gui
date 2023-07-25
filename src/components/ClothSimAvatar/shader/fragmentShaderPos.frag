uniform float time;

uniform vec3 mouse;
uniform sampler2D meta0;
uniform float delta;
uniform vec2 viewSizeXY;

#include <common>

float hash(float n) { return fract(sin(n) * 1e4); }

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash(i), hash(i + 1.0), u);
}


void main (void) {

  vec2 uv = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;

  // vec4 metaData = texture2D(meta0, uv);
  // vec4 velData = texture2D(textureVelocity, uv);
  vec4 posData = texture2D(texturePosition, uv);

  if (posData.w == 0.0) {
    posData.x = (uv.x * 2.0 - 1.0) * viewSizeXY.x;
    posData.y = (uv.y * 2.0 - 1.0) * viewSizeXY.y;
    posData.z = 0.0;// sin(uv.x * 30.0 * 3.141592) * 20.0;
    posData.w = 1.0;
    gl_FragColor = vec4(posData.x, posData.y, posData.z, 1.0);

    return;
  }

  #chunk-computeBody

  gl_FragColor = vec4(newPosition.x, newPosition.y, newPosition.z, 1.0);

}
