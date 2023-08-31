import { useFrame } from "@react-three/fiber";

export function EnvLayout() {
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
  }, 10000);

  return null;
}
