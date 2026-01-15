import { useGLTF } from '@react-three/drei'
import { useCallback, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'

// 预加载3D模型，提升首次加载速度
useGLTF.preload('/model/model.glb')

// 辉光效果图层ID
const BLOOM_LAYER = 1

/**
 * 场景设置Hook
 * 负责加载和配置3D场景，包括材质、阴影、辉光效果等
 * 
 * @returns scene - 3D场景对象
 * @returns transparentMaterial - 半透明线框材质（用于非焦点对象）
 * @returns originalMaterials - 原始材质映射表
 * @returns restoreMaterials - 恢复原始材质的函数
 */
export const useSceneSetup = () => {
  // 加载GLTF模型
  const { scene } = useGLTF('/model/model.glb')

  // 创建半透明线框材质（用于模式切换时的非焦点对象）
  const transparentMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00beff, // 青蓝色
        transparent: true,
        opacity: 0.1, // 几乎透明
        wireframe: true, // 线框模式
      }),
    []
  )

  // 存储所有对象的原始材质，用于模式切换后恢复
  const originalMaterials = useMemo(
    () => new Map<string, THREE.Material | THREE.Material[]>(),
    []
  )

  // 场景初始化设置（在DOM布局前执行）
  useLayoutEffect(() => {
    // 需要应用辉光效果的模型名称列表
    const bloomModels = [
      '承重柱',
      '楼底面',
      '窗户',
      '楼片面',
      '路灯2灯面',
      '路灯灯面',
    ]

    // 遍历场景中的所有对象
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        // 保存原始材质
        if (!originalMaterials.has(obj.uuid)) {
          originalMaterials.set(obj.uuid, obj.material)
        }

        // 启用阴影投射和接收
        obj.castShadow = true
        obj.receiveShadow = true

        // 配置辉光图层
        if (bloomModels.some((name) => obj.name.includes(name))) {
          obj.layers.enable(BLOOM_LAYER) // 启用辉光图层
        } else {
          obj.layers.disable(BLOOM_LAYER) // 禁用辉光图层
          obj.layers.enable(0) // 启用默认图层
        }

        // 保存初始位置（用于楼层管理动画）
        if (!obj.userData.initialPosition) {
          obj.userData.initialPosition = obj.position.clone()
        }

        // 确保车辆模型可见
        if (obj.name.includes('车') || obj.name.includes('Car')) {
          obj.visible = true
        }
      }
    })
  }, [scene, originalMaterials])

  /**
   * 恢复所有对象的原始材质
   * 用于退出特殊模式（水力/电力监测）时恢复场景
   */
  const restoreMaterials = useCallback(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && originalMaterials.has(obj.uuid)) {
        obj.material = originalMaterials.get(obj.uuid)!
      }
    })
  }, [scene, originalMaterials])

  return { scene, transparentMaterial, originalMaterials, restoreMaterials }
}
