import { useGLTF } from '@react-three/drei'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'

// Preload the model
useGLTF.preload('/model/model.glb')

const BLOOM_LAYER = 1

export const useSceneSetup = () => {
  const { scene } = useGLTF('/model/model.glb')

  const transparentMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00beff,
        transparent: true,
        opacity: 0.1,
        wireframe: true,
      }),
    []
  )

  const originalMaterials = useMemo(
    () => new Map<string, THREE.Material | THREE.Material[]>(),
    []
  )

  useLayoutEffect(() => {
    const bloomModels = [
      '承重柱',
      '楼底面',
      '窗户',
      '楼片面',
      '路灯2灯面',
      '路灯灯面',
    ]

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        // Save original material
        if (!originalMaterials.has(obj.uuid)) {
          originalMaterials.set(obj.uuid, obj.material)
        }

        // Shadows
        obj.castShadow = true
        obj.receiveShadow = true

        // Bloom Layer
        if (bloomModels.some((name) => obj.name.includes(name))) {
          obj.layers.enable(BLOOM_LAYER)
        } else {
          obj.layers.disable(BLOOM_LAYER)
          obj.layers.enable(0)
        }

        // Save initial positions
        if (!obj.userData.initialPosition) {
          obj.userData.initialPosition = obj.position.clone()
        }

        // Visibility Check (Cars)
        if (obj.name.includes('车') || obj.name.includes('Car')) {
          obj.visible = true
        }
      }
    })
  }, [scene, originalMaterials])

  const restoreMaterials = useCallback(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && originalMaterials.has(obj.uuid)) {
        obj.material = originalMaterials.get(obj.uuid)!
      }
    })
  }, [scene, originalMaterials])

  return { scene, transparentMaterial, originalMaterials, restoreMaterials }
}
