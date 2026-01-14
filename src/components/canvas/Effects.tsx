import { Bloom, EffectComposer, Outline } from '@react-three/postprocessing'
import { useStore } from '../../store/useStore'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

export const Effects = () => {
  const { selectedObjects } = useStore()
  const { scene, camera } = useThree()

  const selectedMeshes = useMemo(() => {
    if (selectedObjects.length === 0) return []
    const meshes: THREE.Object3D[] = []
    selectedObjects.forEach((uuid) => {
      const obj = scene.getObjectByProperty('uuid', uuid)
      if (obj) meshes.push(obj)
    })
    return meshes
  }, [selectedObjects, scene])

  return (
    <EffectComposer enableNormalPass={false} camera={camera}>
      <Bloom 
        luminanceThreshold={0.164} // Lower threshold to pick up more glow
        mipmapBlur 
        intensity={1.5} // Increased intensity
        radius={0.6}
        levels={8}
      />
      <Outline
        selection={selectedMeshes}
        edgeStrength={10}
        pulseSpeed={1}
        visibleEdgeColor={0xff0000}
        hiddenEdgeColor={0xff0000}
      />
    </EffectComposer>
  )
}
