//
// vec2 uv = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;

// float damping = 0.98;
// float damping = 0.985;
float damping = 0.95;

vec4 nowPos = texture2D( texturePosition, uv );
vec4 offsets = texture2D( textureOffset, uv );
vec4 velocity = texture2D( textureVelocity, uv );

float yAnchor = 100.0;
vec3 anchor = vec3( offsets.x, yAnchor + 0.0 * offsets.y, offsets.z );

// Newton's law: F = M * A
float mass = 24.0;
vec3 acceleration = vec3(0.0, 0.0, 0.0);

// 1. apply gravity's force:
vec3 gravity = vec3(0.0, 9.8, 0.0);
gravity /= mass;
acceleration += gravity;

// 2. apply the spring force
float restLength = yAnchor - offsets.y;
// float springConstant = 15.0;
float springConstant = 15.0;

// Vector pointing from anchor to point position
vec3 springForce = vec3(nowPos.x - anchor.x, nowPos.y - anchor.y, nowPos.z - anchor.z);

// length of the vector
float distanceV = length( springForce );
// stretch is the difference between the current distanceV and restLength
float stretch =  distanceV - restLength;

stretch *= 0.1;

// Calculate springForce according to Hooke's Law
springForce = normalize(springForce);
springForce *= (springConstant * stretch);

springForce /= mass;

acceleration += springForce;

//
vec3 wind = vec3(normalize(vec3(mouse)) * hash(time * 1.5) * -1.25);
wind /= mass;
acceleration += (wind);

//
vec3 hand;
float mDist = length(mouse - nowPos.xyz);

hand = normalize(mouse - nowPos.xyz) * -2.0;

// hand.yz *= 0.2;


hand /= mass;
acceleration += hand;

//
velocity.rgb += acceleration;
velocity.rgb *= damping;

//
vec3 newPosition = vec3(nowPos.x - velocity.x, nowPos.y - velocity.y, nowPos.z - velocity.z);

//

//
