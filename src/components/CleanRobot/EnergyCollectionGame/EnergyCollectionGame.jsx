import { Box, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Game } from './Game/Game'

export function EnergyCollectionGame() {
  return (
    <>
      {/* <div className='flex items-center justify-between h-full select-none'> */}
      {/* <Canvas className='h-full select-none'> */}
      <Game></Game>
      {/* </Canvas> */}
      {/* </div> */}
    </>
  )
}
