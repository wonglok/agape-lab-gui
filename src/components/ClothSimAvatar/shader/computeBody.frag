//
// vec2 uv = vec2(gl_FragCoord.x, gl_FragCoord.y) / resolution.xy;

// float damping = 0.98;
// float damping = 0.985;
float damping = 0.95;

float tallerY = 8.5;

vec4 nowPos = texture2D( texturePosition, uv );
vec4 offsets = texture2D( textureOffset, uv );
vec4 velocity = texture2D( textureVelocity, uv );

float yAnchor = viewSizeXY.y;
vec3 anchor = vec3( offsets.x, yAnchor + 0.0 * offsets.y + tallerY, offsets.z + pow((1.0 - uv.y), 2.0) * sin(offsets.x * 2.0) * 2.0 );

// Newton's law: F = M * A
float mass = 13.0;
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

// stretch *= 0.2;

// Calculate springForce according to Hooke's Law
springForce = normalize(springForce);
springForce *= (springConstant * stretch);

springForce /= mass;

acceleration += springForce;

vec3 mouse2 = mouse;
mouse2.y -= tallerY;

//
vec3 wind = vec3(normalize(mouse2) * hash(time * 0.5) * -2.25);
wind /= mass;
acceleration += (wind);


//
vec3 hand;
float mDist = length(mouse2 - nowPos.xyz);

hand = normalize(mouse2 - nowPos.xyz) * 5.0;

// hand = normalize(hand);

// hand.xy *= 0.25;


// hand += normalize(mouse2 - nowPos.xyz) * -1.0;

hand /= mass;
acceleration += hand;

//
velocity.rgb += acceleration;
velocity.rgb *= damping;

//
vec3 newPosition = vec3(nowPos.x - velocity.x, nowPos.y - velocity.y, nowPos.z - velocity.z);

//

//
