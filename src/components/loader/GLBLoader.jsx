import { useGLTF } from '@react-three/drei'

export function GLBLoader({ url, decorate = () => {} }) {
  let glb = useGLTF(url)

  return decorate({ glb }) || null
}
