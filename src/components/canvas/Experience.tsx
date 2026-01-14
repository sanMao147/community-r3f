import { OrbitControls } from '@react-three/drei'
import { CommunityModel } from './CommunityModel'
import { Effects } from './Effects'
import { useRef } from 'react'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export const Experience = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <color attach="background" args={['#000000']} />
      
      {/* Lights */}
      <ambientLight intensity={0.4} color="#6d78b0" />
      <directionalLight
        position={[100, 100, -100]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={0.05}
        shadow-normalBias={0.05}
      />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enableZoom
        enablePan
        minDistance={1}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[-9.94, 1.36, 3.18]}
      />

      {/* Scene Content */}
      <CommunityModel controlsRef={controlsRef} />
      
      {/* Post Processing */}
      <Effects />
    </>
  )
}
