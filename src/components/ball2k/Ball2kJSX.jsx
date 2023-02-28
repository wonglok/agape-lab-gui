import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations, MeshTransmissionMaterial } from '@react-three/drei'
import { Color } from 'three'

export function Ball2kJSX(props) {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/2022/02/28/mech/ball2k.glb')
  const { names, actions } = useAnimations(animations, group)

  useEffect(() => {
    names.forEach((n) => {
      actions[n]?.fadeIn(0.5).play()
    })

    return () => {
      names.forEach((n) => {
        actions[n]?.stop()
      })
    }
  }, [names, actions])

  materials['Neon.001'].color = new Color('#00ffff')
  materials['Neon.001'].emissive = new Color('#00ffff')
  materials['Neon.001'].emissiveIntensity = 1

  return (
    <group ref={group} {...props} dispose={null}>
      <group name='AuxScene'>
        <group name='Circe_Rig001' rotation={[0, -0.1, 0]} scale={1.6}>
          <primitive object={nodes.Ctrl_Master} />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow022'
            geometry={nodes.RetopoFlow022.geometry}
            material={materials['Neon.001']}
            skeleton={nodes.RetopoFlow022.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow005'
            geometry={nodes.RetopoFlow005.geometry}
            material={materials['Neon.001']}
            skeleton={nodes.RetopoFlow005.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow017'
            geometry={nodes.RetopoFlow017.geometry}
            material={materials['Light blocker.004']}
            skeleton={nodes.RetopoFlow017.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow021'
            geometry={nodes.RetopoFlow021.geometry}
            material={materials['Neon.001']}
            skeleton={nodes.RetopoFlow021.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow023'
            geometry={nodes.RetopoFlow023.geometry}
            material={materials['Neon.001']}
            skeleton={nodes.RetopoFlow023.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow007'
            geometry={nodes.RetopoFlow007.geometry}
            material={materials['UV01.002']}
            skeleton={nodes.RetopoFlow007.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow016'
            geometry={nodes.RetopoFlow016.geometry}
            material={materials['uv03.002']}
            skeleton={nodes.RetopoFlow016.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow020'
            geometry={nodes.RetopoFlow020.geometry}
            material={materials['Material.004']}
            skeleton={nodes.RetopoFlow020.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow013'
            geometry={nodes.RetopoFlow013.geometry}
            material={materials['Light blocker.003']}
            skeleton={nodes.RetopoFlow013.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow014'
            geometry={nodes.RetopoFlow014.geometry}
            material={materials['ligh.002']}
            skeleton={nodes.RetopoFlow014.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow012'
            geometry={nodes.RetopoFlow012.geometry}
            material={materials['UV02.004']}
            skeleton={nodes.RetopoFlow012.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow004'
            geometry={nodes.RetopoFlow004.geometry}
            material={materials['UV08.002']}
            skeleton={nodes.RetopoFlow004.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow003'
            geometry={nodes.RetopoFlow003.geometry}
            material={materials['UV02.003']}
            skeleton={nodes.RetopoFlow003.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow025'
            geometry={nodes.RetopoFlow025.geometry}
            material={materials['UV_Accesories_Hydrl.002']}
            skeleton={nodes.RetopoFlow025.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow026'
            geometry={nodes.RetopoFlow026.geometry}
            material={materials['UV_Accesories_Joints.002']}
            skeleton={nodes.RetopoFlow026.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow018'
            geometry={nodes.RetopoFlow018.geometry}
            material={materials['UV05.002']}
            skeleton={nodes.RetopoFlow018.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow006'
            geometry={nodes.RetopoFlow006.geometry}
            material={materials['UV_Accesories_Engn.002']}
            skeleton={nodes.RetopoFlow006.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow024'
            geometry={nodes.RetopoFlow024.geometry}
            material={materials['UV07b.002']}
            skeleton={nodes.RetopoFlow024.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow019'
            geometry={nodes.RetopoFlow019.geometry}
            material={materials['UV04.002']}
            skeleton={nodes.RetopoFlow019.skeleton}
          />
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow002'
            geometry={nodes.RetopoFlow002.geometry}
            // material={materials['UV07Glass.002']}
            skeleton={nodes.RetopoFlow002.skeleton}>
            <MeshTransmissionMaterial
              thickness={0.2}
              chromaticAberration={0.3}
              roughnessMap={materials['UV07Glass.002'].roughnessMap}
              metalnessMap={materials['UV07Glass.002'].metalnessMap}
              transmissionSampler></MeshTransmissionMaterial>
          </skinnedMesh>
          <skinnedMesh
            frustumCulled={false}
            name='RetopoFlow015'
            geometry={nodes.RetopoFlow015.geometry}
            material={materials['UV07a.002']}
            skeleton={nodes.RetopoFlow015.skeleton}
          />
        </group>
      </group>
    </group>
  )
}
