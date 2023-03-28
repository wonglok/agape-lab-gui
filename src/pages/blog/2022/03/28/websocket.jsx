export default function WebSocketPage() {
  return (
    <div>
      {/*  */}
      <button
        onClick={() => {
          //
          let ws = new WebSocket(`ws://localhost:8173`)

          ws.addEventListener('open', (ev) => {
            ws.send('to-blender-123')
          })
          ws.addEventListener('message', (ev) => {
            console.log('receive data from blender', ev.data)
          })
        }}>
        Open WebSocket to Blender
      </button>
      {/*  */}
    </div>
  )
}
