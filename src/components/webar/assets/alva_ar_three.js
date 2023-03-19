/**
 * Example usage:
 *      import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/module.js';
 *      import { AlvaAR } from 'alva_ar.js';
 *      import { AlvaAR } from 'alva_ar_three.js';
 *
 *      const alva = await AlvaAR.Initialize( ... );
 *      const applyPose = AlvaARConnectorTHREE.Initialize( THREE )
 *      const renderer = new THREE.WebGLRenderer( ... );
 *      const camera = new THREE.PerspectiveCamera( ... );
 *      const scene = new THREE.Scene();
 *      ...
 *
 *      function loop()
 *      {
 *          const imageData = ctx.getImageData( ... );
 *          const pose = alva.findCameraPose( imageData );
 *
 *          if( pose ) applyPose( pose, camera.quaternion, camera.position );
 *
 *          renderer.render( this.scene, this.camera );
 *      }
 */

import { Vector3 } from 'three'
import { Quaternion } from 'three'
import { Matrix4 } from 'three'

class AlvaARConnectorTHREE {
  static Initialize() {
    const m = new Matrix4()
    const q = new Quaternion()
    // const t = new Vector3(pose[12], pose[13], pose[14])
    const t = new Vector3()
    const a = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0)
    const x3 = new Vector3(1, 0, 0)

    //
    return (pose, rotationQuaternion, translationVector) => {
      t.set(pose[12], pose[13], pose[14])

      a.set(0, 0, 0, 0)

      x3.set(1, 0, 0)
      a.setFromAxisAngle(x3, 0)

      m.fromArray(pose)
      q.setFromRotationMatrix(m)
      q.multiply(a)

      rotationQuaternion !== null && rotationQuaternion.set(-q.x, q.y, q.z, q.w)
      translationVector !== null && translationVector.set(t.x, -t.y, -t.z)
    }
  }
}

export { AlvaARConnectorTHREE }
