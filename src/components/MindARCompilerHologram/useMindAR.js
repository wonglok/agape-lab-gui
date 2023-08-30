import { create } from 'zustand'

export const useMindAR = create((set, get) => {
  return {
    //
    progress: 0,
    start: false,
    stop: () => {},
    camera: false,
    anchor: false,
  }
})
