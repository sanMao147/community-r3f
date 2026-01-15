import { Bloom, EffectComposer, Outline } from '@react-three/postprocessing'
import { useStore } from '../../store/useStore'
import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 后期处理效果组件
 * 应用辉光（Bloom）和轮廓高亮（Outline）效果
 * 
 * - Bloom：为发光材质添加辉光效果（路灯、窗户等）
 * - Outline：为选中的监测点添加红色轮廓高亮
 */
export const Effects = () => {
  const { selectedObjects } = useStore() // 获取选中对象的UUID列表
  const { scene, camera } = useThree()

  /**
   * 根据UUID查找场景中的对象
   * 用于轮廓高亮效果
   */
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
      {/* 辉光效果 */}
      <Bloom 
        luminanceThreshold={0.164} // 亮度阈值：低于此值的不发光
        mipmapBlur // 使用mipmap模糊，性能更好
        intensity={1.5} // 辉光强度
        radius={0.6} // 辉光半径
        levels={8} // 模糊层级
      />
      
      {/* 轮廓高亮效果 */}
      <Outline
        selection={selectedMeshes} // 需要高亮的对象列表
        edgeStrength={10} // 边缘强度
        pulseSpeed={1} // 脉冲速度（呼吸效果）
        visibleEdgeColor={0xff0000} // 可见边缘颜色（红色）
        hiddenEdgeColor={0xff0000} // 隐藏边缘颜色（红色）
      />
    </EffectComposer>
  )
}
