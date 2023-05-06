import md5 from 'md5'
import { generateUUID } from 'three/src/math/MathUtils'
import { create } from 'zustand'

export const getID = () => {
  return `_${md5(generateUUID())}`
}
export const useScatter = create((set) => {
  return {
    mode: 'drag',
    list: [
      //
    ],
    deploy: [],
  }
})
