import { BufferGeometryLoader, ObjectLoader, PerspectiveCamera, Raycaster, Vector3 } from 'three'
import { MeshBVH, NOT_INTERSECTED, CONTAINED, INTERSECTED } from 'three-mesh-bvh'
import { BufferGeometry } from 'three147'

let bvh = false

let raycaster = new Raycaster()

let dest = new Vector3()
const loader = new ObjectLoader()

self.onmessage = (ev) => {
  if (ev.data.pointCloudGeo) {
    const geometriesLoader = new BufferGeometryLoader()
    let geo = geometriesLoader.parse(ev.data.pointCloudGeo)
    bvh = new MeshBVH(geo)
    self.postMessage({ type: 'ready' })
  }

  if (ev.data.mouse && ev.data.camera && bvh) {
    //
    let closestDistance = Infinity

    let mouse = ev.data.mouse
    let cameraJSON = ev.data.camera

    let camera = loader.parse(cameraJSON)

    raycaster.setFromCamera(mouse, camera)

    let ray = raycaster.ray

    dest.set(0, 0, 0)
    const localThreshold = 1

    let currentDist = Infinity
    bvh.shapecast({
      boundsTraverseOrder: (box) => {
        // traverse the closer bounds first.
        return box.distanceToPoint(ray.origin)
      },
      intersectsBounds: (box, isLeaf, score) => {
        // if we've already found a point that's closer then the full bounds then
        // don't traverse further.
        if (score > Infinity) {
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

    console.log(dest)

    if (dest.length() <= 0.1) {
      return
    }

    self.postMessage({ type: 'raycast', point: dest.toArray() })
  }
}
