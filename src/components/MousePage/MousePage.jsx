import { Canvas } from '@react-three/fiber'
import { MouseGesture } from './MouseGesture'
import { useMouse } from './useMouse.js'
import { Stats } from '@react-three/drei'
export function MousePage() {
  let showStartMenu = useMouse((r) => r.showStartMenu)
  let loading = useMouse((r) => r.loading)
  return (
    <>
      <Canvas
        onCreated={(st) => {
          st.gl.domElement.ontouchstart = (ev) => {
            ev.preventDefault()
          }
          st.gl.domElement.ontouchmove = (ev) => {
            ev.preventDefault()
          }
        }}>
        <Stats></Stats>

        <MouseGesture></MouseGesture>
      </Canvas>

      {showStartMenu && (
        <div className='absolute top-0 left-0 flex items-center justify-center w-full h-full'>
          {
            <button
              className='p-2 bg-gray-200'
              onClick={() => {
                useMouse.getState().initVideo()
              }}>
              {loading ? `Loading...` : `Start`}
            </button>
          }
        </div>
      )}
    </>
  )
}
