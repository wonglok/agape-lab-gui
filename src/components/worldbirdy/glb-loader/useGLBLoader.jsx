import { useLoader, useThree } from '@react-three/fiber'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import { GLTFLoader } from './GLTFLoader'
import { MyGLTFLoader } from './MyGLTFLoader147'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export function useGLBLoader(sceneURL) {
  let glb = useLoader(GLTFLoader, sceneURL, (loader) => {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    loader.setDRACOLoader(dracoLoader)
  })

  window.camera = useThree((s) => s.camera)
  glb.url = sceneURL
  return glb
}
