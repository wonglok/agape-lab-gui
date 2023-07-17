// import '@google/model-viewer'

import { useEffect, useState } from 'react'

export function MV() {
  let [show, setShow] = useState(false)
  useEffect(() => {
    window.remoteImport('https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js').then(() => {
      setShow(true)
    })
  }, [])
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
