import { create } from 'zustand'

export const useFinger = create((set) => {
  return {
    videoTexture: false,
    menuText: 'Enter',
    noMenu: false,
  }
})
