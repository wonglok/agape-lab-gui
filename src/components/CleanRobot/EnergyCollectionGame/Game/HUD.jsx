import { useFrame, useThree } from '@react-three/fiber'
import { PlayerBucket } from './PlayerBucket'
import { useRef } from 'react'

export function HUD() {
  let viewport = useThree((r) => r.viewport)
  let camera = useThree((r) => r.camera)
  // let size = useThree((r) => r.size)
  let bl = useRef()
  let br = useRef()
  let master = useRef()
  useFrame(({ controls }) => {
    let target = [0, 0, 0]
    if (controls) {
      target = controls.target
    }
    let { width, height } = viewport.getCurrentViewport(camera, target)

    let minval = Math.min(width, height)

    let padding = (minval / 100) * 15
    if (bl.current) {
      bl.current.scale.setScalar((minval / 100) * 10)
      bl.current.position.x = -width / 2 + padding
      bl.current.position.y = -height / 2 + padding
    }
    if (br.current) {
      br.current.scale.setScalar((minval / 100) * 10)
      br.current.position.x = width / 2 + -padding
      br.current.position.y = -height / 2 + padding
    }

    if (master.current) {
      master.current.lookAt(camera.position)
    }
  })

  return (
    <>
      {/*  */}
      <group ref={master}>
        <group ref={bl}>
          <PlayerBucket playerName='player1'></PlayerBucket>
        </group>

        <group ref={br}>
          <PlayerBucket playerName='player2'></PlayerBucket>
        </group>
      </group>

      {/*  */}
    </>
  )
}
