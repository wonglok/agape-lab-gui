import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { AnimationMixer } from "three";

let cache = new Map();
export function LoaderGLB({
  url,
  children,
  decorate = () => {},
  animate = false,
}) {
  let glb = useGLTF(`${url}`);

  if (cache.has(url)) {
    glb = cache.get(url);
  } else {
    let result = decorate({ glb });
    if (result) {
      glb = result;
    }
  }

  let mixer = useMemo(() => {
    return new AnimationMixer(glb.scene);
  }, [glb.scene]);

  useFrame((st, dt) => {
    mixer.update(dt);
  });

  if (animate) {
    let action = mixer.clipAction(glb?.animations[0], glb.scene);
    action.reset()?.play();
  }

  return <>{typeof children === "function" && children({ glb })}</>;
}
