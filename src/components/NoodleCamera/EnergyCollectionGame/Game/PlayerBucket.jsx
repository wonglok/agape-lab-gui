import { Box, Sphere } from '@react-three/drei'
import { MeshTransmissionMaterial } from '@react-three/drei'

export function PlayerBucket({ playerName = 'player1' }) {
  return (
    <group>
      {/*  */}

      <Sphere args={[1, 32, 32]}>
        <MeshTransmissionMaterial
          roughness={0.1}
          samples={5}
          chromaticAberration={0}
          transmission={1}
          thickness={3}
          metalness={0.0}
          resolution={128}
          transmissionSampler
        ></MeshTransmissionMaterial>
      </Sphere>

      {/*  */}
    </group>
  )
}
