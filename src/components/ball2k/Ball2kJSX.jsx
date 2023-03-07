import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations, MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function Ball2kJSX(props) {
  const group = useRef()
  const { nodes, materials, animations, scene } = useGLTF('/2022/02/28/mech/yoyo.glb')
  const { actions, names, mixer } = useAnimations(animations, group)
  useFrame((st, dt) => {
    mixer.update(dt)
  })
  useEffect(() => {
    scene.traverse((it) => {
      if (it.material) {
      }
    })

    names.forEach((n) => {
      actions[n]?.play()
    })
  }, [names, actions, scene])

  return (
    <group ref={group} {...props} dispose={null}>
      <group frustumCulled={false} name='Scene'>
        <group frustumCulled={false} name='Circe_Rig001' rotation={[0, -0.06, 0]} scale={1.64}>
          <primitive frustumCulled={false} object={nodes.Ctrl_Master} />
          <group frustumCulled={false} name='RetopoFlow002'>
            {/* <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010'
              geometry={nodes.RetopoFlow010.geometry}
              material={
                <MeshTransmissionMaterial
                  thickness={0.2}
                  chromaticAberration={0.1}
                  roughnessMap={materials['UV07Glass.002'].roughnessMap}
                  metalnessMap={materials['UV07Glass.002'].metalnessMap}
                  transmissionSampler></MeshTransmissionMaterial>
              }
              skeleton={nodes.RetopoFlow010.skeleton}
            /> */}
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_1'
              geometry={nodes.RetopoFlow010_1.geometry}
              material={materials['UV02.003']}
              skeleton={nodes.RetopoFlow010_1.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_2'
              geometry={nodes.RetopoFlow010_2.geometry}
              material={materials['UV08.002']}
              skeleton={nodes.RetopoFlow010_2.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_3'
              geometry={nodes.RetopoFlow010_3.geometry}
              material={materials['Neon.001']}
              skeleton={nodes.RetopoFlow010_3.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_4'
              geometry={nodes.RetopoFlow010_4.geometry}
              material={materials['UV_Accesories_Engn.002']}
              skeleton={nodes.RetopoFlow010_4.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_5'
              geometry={nodes.RetopoFlow010_5.geometry}
              material={materials['UV01.002']}
              skeleton={nodes.RetopoFlow010_5.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_6'
              geometry={nodes.RetopoFlow010_6.geometry}
              material={materials['UV02.004']}
              skeleton={nodes.RetopoFlow010_6.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_7'
              geometry={nodes.RetopoFlow010_7.geometry}
              material={materials['Light blocker.003']}
              skeleton={nodes.RetopoFlow010_7.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_8'
              geometry={nodes.RetopoFlow010_8.geometry}
              material={materials['ligh.002']}
              skeleton={nodes.RetopoFlow010_8.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_9'
              geometry={nodes.RetopoFlow010_9.geometry}
              material={materials['UV07a.002']}
              skeleton={nodes.RetopoFlow010_9.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_10'
              geometry={nodes.RetopoFlow010_10.geometry}
              material={materials['uv03.002']}
              skeleton={nodes.RetopoFlow010_10.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_11'
              geometry={nodes.RetopoFlow010_11.geometry}
              material={materials['Light blocker.004']}
              skeleton={nodes.RetopoFlow010_11.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_12'
              geometry={nodes.RetopoFlow010_12.geometry}
              material={materials['UV05.002']}
              skeleton={nodes.RetopoFlow010_12.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_13'
              geometry={nodes.RetopoFlow010_13.geometry}
              material={materials['UV04.002']}
              skeleton={nodes.RetopoFlow010_13.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_14'
              geometry={nodes.RetopoFlow010_14.geometry}
              material={materials['Material.004']}
              skeleton={nodes.RetopoFlow010_14.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_15'
              geometry={nodes.RetopoFlow010_15.geometry}
              material={materials['Grids.002']}
              skeleton={nodes.RetopoFlow010_15.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_16'
              geometry={nodes.RetopoFlow010_16.geometry}
              material={materials['Neon.002']}
              skeleton={nodes.RetopoFlow010_16.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_17'
              geometry={nodes.RetopoFlow010_17.geometry}
              material={materials['Neon.005']}
              skeleton={nodes.RetopoFlow010_17.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_18'
              geometry={nodes.RetopoFlow010_18.geometry}
              material={materials['UV07b.002']}
              skeleton={nodes.RetopoFlow010_18.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_19'
              geometry={nodes.RetopoFlow010_19.geometry}
              material={materials['UV_Accesories_Hydrl.002']}
              skeleton={nodes.RetopoFlow010_19.skeleton}
            />
            <skinnedMesh
              frustumCulled={false}
              name='RetopoFlow010_20'
              geometry={nodes.RetopoFlow010_20.geometry}
              material={materials['UV_Accesories_Joints.002']}
              skeleton={nodes.RetopoFlow010_20.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  )
}
