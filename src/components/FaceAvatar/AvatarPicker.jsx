import { useEffect, useRef } from 'react'

export function AvatarPicker({ onURL, rounded = false, reload = 0 }) {
  let iframeRef = useRef()
  useEffect(() => {
    iframeRef.current.src = `https://effectnode.readyplayer.me/`
  }, [reload])
  useEffect(() => {
    function receiveMessage(event) {
      setTimeout(() => {
        if (typeof event.data === 'string') {
          function validURL(str) {
            var pattern = new RegExp(
              '^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$',
              'i'
            ) // fragment locator
            return !!pattern.test(str)
          }

          if (validURL(event.data)) {
            console.log(event.data);
            onURL(event.data)
          }
        }
      }, 0)
    }

    window.addEventListener('message', receiveMessage, false)
    return () => {
      window.removeEventListener('message', receiveMessage)
    }
  }, [])
  return (
    <iframe
      className={'w-full h-full border-none ' + (rounded ? ' rounded-xl' : ' ')}
      ref={iframeRef}
    ></iframe>
  )
}
