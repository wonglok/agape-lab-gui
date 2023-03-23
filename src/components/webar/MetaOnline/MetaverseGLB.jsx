import { useEffect, useState } from 'react'
import { YoMeta, useMeta } from './useMeta'
import { useFrame, useThree } from '@react-three/fiber'
import { WalkerCam } from './WalkerCam'
import { Color } from 'three'

export function MetaverseGLB({ glb, offsetY = 0.01, children }) {
  let camera = useThree((r) => r.camera)
  let gl = useThree((r) => r.gl)
  let game = useMeta((r) => r.game)

  let [ready, setReady] = useState(false)

  useEffect(() => {
    useMeta.setState({
      game: new YoMeta({ camera, gl }),
    })

    return () => {
      if (useMeta.getState()?.game) {
        useMeta.getState()?.game.clean()
      }
    }
  }, [camera, gl])

  useEffect(() => {
    if (game && glb?.scene) {
      game.parseScene({ scene: glb.scene }).then(() => {
        setReady(true)
      })
    }
  }, [glb, game])

  useEffect(() => {
    if (game && offsetY) {
      game.offsetY = offsetY
    }
  }, [glb, game, offsetY])

  useFrame(() => {
    if (game && game.updatePlayer && typeof game.updatePlayer === 'function') {
      game.updatePlayer()
    }
  })

  //
  return (
    <group
      onClick={(ev) => {
        console.log(ev.object.name)

        let item = ev.object

        if (item.name === 'Cylinder002_2') {
          item.material = item.material.clone()
          item.material.color = new Color('#ffffff')
        }
      }}>
      <group>{game && <primitive object={game.player}></primitive>}</group>
      {game && <>{/* <WalkerCam></WalkerCam> */}</>}
      <primitive object={glb.scene}></primitive>
      {typeof children === 'function' && ready && children({ glb, game })}
    </group>
  )
}
