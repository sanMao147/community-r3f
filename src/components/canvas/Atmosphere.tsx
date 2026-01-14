import { Float, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const Meteors = ({ count = 20 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const speed = 0.5 + Math.random() * 2
      // Random start position in a wide area above
      const x = (Math.random() - 0.5) * 300
      const y = 80 + Math.random() * 50
      const z = (Math.random() - 0.5) * 300
      const size = 0.5 + Math.random() * 1.5
      temp.push({ speed, x, y, z, size, offset: Math.random() * 100 })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return

    particles.forEach((particle, i) => {
      // Calculate position based on time
      const time =
        state.clock.getElapsedTime() * particle.speed + particle.offset
      // Loop every 5-10 seconds
      const loopTime = 8
      const t = (time % loopTime) / loopTime

      // Trajectory: falling diagonally
      const startX = particle.x
      const startY = particle.y
      const startZ = particle.z

      // End position
      const endX = startX - 100
      const endY = startY - 100

      // Current pos
      const cx = THREE.MathUtils.lerp(startX, endX, t)
      const cy = THREE.MathUtils.lerp(startY, endY, t)

      dummy.position.set(cx, cy, startZ)

      // Orientation: pointing along velocity vector (-1, -1, 0)
      dummy.rotation.z = Math.PI / 4

      // Scale: stretch along movement, thin otherwise
      // Fade in/out at edges
      const scale = particle.size
      dummy.scale.set(scale * 0.2, scale * 8, scale * 0.2) // Y is length in local space if we rotate Z

      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)

      // Hacky way to set opacity per instance?
      // InstancedMesh doesn't support per-instance opacity easily without custom shader.
      // So we just use scale 0 to hide.
      if (t > 0.95 || t < 0.05) dummy.scale.set(0, 0, 0)
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
    >
      {/* Capsule or Cylinder for trail */}
      <cylinderGeometry args={[0.2, 0.05, 1, 8]} />
      <meshBasicMaterial
        color='#aaddff'
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}

const FloatingOrbs = () => {
  return (
    <group>
      {[...Array(8)].map((_, i) => (
        <Float
          key={i}
          speed={0.5 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={10}
          floatingRange={[20, 60]}
        >
          <mesh
            position={[
              (Math.random() - 0.5) * 200,
              30,
              (Math.random() - 0.5) * 200,
            ]}
          >
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial
              color={[1.2, 1.5, 3]}
              toneMapped={false}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export const Atmosphere = () => {
  return (
    <group>
      <Stars
        radius={200}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <Meteors count={30} />
      <FloatingOrbs />
      {/* Ambient glow for the whole scene */}
      <ambientLight
        intensity={0.2}
        color='#001133'
      />
    </group>
  )
}
