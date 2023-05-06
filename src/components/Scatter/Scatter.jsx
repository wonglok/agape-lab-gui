import { Box, MapControls, PerspectiveCamera, Preload } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useScatter } from './useScatter'
import { ToolBar } from './Toolbar'

export function Scatter() {
  let mode = useScatter((r) => r.mode)
  return (
    <div className='w-full h-full'>
      <Canvas className=' absolute top-0 left-0'>
        {/*  */}
        {/*  */}
        {/* Floor */}
        <Box args={[100, 0.1, 100]}></Box>
        {/*  */}
        <PerspectiveCamera makeDefault position={[0, 15, 15]}></PerspectiveCamera>
        <MapControls enabled={mode === 'drag'} makeDefault target={[0, 0, 0]}></MapControls>
        {/*  */}
      </Canvas>

      <div className=' absolute top-0 left-0'>
        <div className='p-3'>
          <button
            onClick={() => {
              useScatter.setState({ mode: 'drag' })
            }}
            className={`${
              mode === 'drag' ? `bg-green-300` : `bg-white`
            }  px-5 py-2 text-sm  border border-r-0 border-gray-300 shadow-lg shadow-gray-400 rounded-l-2xl`}>
            Navigate
          </button>
          <button
            onClick={() => {
              useScatter.setState({ mode: 'addItem' })
            }}
            className={`${
              mode === 'addItem' ? `bg-green-300` : `bg-white`
            }  px-5 py-2 text-sm  border border-gray-300 shadow-lg shadow-gray-400 rounded-r-2xl`}>
            Add Item on Floor
          </button>
        </div>
      </div>
      <ToolBar></ToolBar>
    </div>
  )
}

//
