// import '@google/model-viewer'

import { useEffect, useState } from 'react'

export function MV() {
  let [show, setShow] = useState(false)
  useEffect(() => {
    import('@google/model-viewer').then(() => {
      setShow(true)
    })
  })
  return (
    <>
      {show && (
        <model-viewer
          class='w-full h-full'
          alt='Room'
          src='/room/room.glb'
          ar
          environment-image='/lok/shanghai.hdr'
          // poster='shared-assets/models/NeilArmstrong.webp'
          shadow-intensity='1'
          camera-controls
          touch-action='pan-y'></model-viewer>
      )}
    </>
  )
}
