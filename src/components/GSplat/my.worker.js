import { ObjectLoader, PerspectiveCamera, Raycaster, Vector3 } from 'three'
import { MeshBVH } from 'three-mesh-bvh'

let bvh = false

let raycaster = new Raycaster()

let dest = new Vector3()
const loader = new ObjectLoader()

self.onmessage = (ev) => {
  console.log(ev.data)

  if (ev.data.bvhGeo) {
    bvh = new MeshBVH(ev.data.bvhGeo, { lazyGeneration: false })
  }

  if (ev.data.mouse) {
    //
    let closestDistance = Infinity

    let mouse = ev.data.mouse
    let cameraJSON = ev.data.camera

    let camera = loader.parse(cameraJSON)
    raycaster.setFromCamera(mouse, camera)
    let ray = raycaster.ray

    //

    dest.set(0, 0, 0)
    const localThreshold = 2

    let currentDist = Infinity
    bvh.shapecast({
      boundsTraverseOrder: (box) => {
        // traverse the closer bounds first.
        return box.distanceToPoint(ray.origin)
      },
      intersectsBounds: (box, isLeaf, score) => {
        // if we've already found a point that's closer then the full bounds then
        // don't traverse further.
        if (score > closestDistance) {
          return NOT_INTERSECTED
        }

        box.expandByScalar(localThreshold)
        return ray.intersectsBox(box) ? INTERSECTED : NOT_INTERSECTED
      },
      intersectsTriangle: (triangle) => {
        let dist = ray.distanceToPoint(triangle.a)
        if (dist < currentDist) {
          currentDist = dist
          dest.copy(triangle.a)
        }
      },
    })

    if (dest.length() === 0.0) {
      return
    }

    self.postMessage({ type: 'raycast', p: dest.toArray() })
  }
}
