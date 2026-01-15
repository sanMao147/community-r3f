import { Html } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * 楼栋标签组件属性接口
 */
interface BuildingLabelsProps {
  scene: THREE.Group // 3D场景对象
  onSelect: (name: string, position: [number, number, number]) => void // 选择楼栋的回调函数
}

/**
 * 楼栋标签组件
 * 在楼层管理模式下，为每个楼栋显示可点击的标签
 * 点击标签后会聚焦到对应楼栋
 */
export const BuildingLabels = ({ scene, onSelect }: BuildingLabelsProps) => {
  const { mode, currentBuilding } = useStore()
  
  /**
   * 计算楼栋标签列表
   * 只在楼层管理模式且未选中楼栋时显示
   */
  const labels = useMemo(() => {
    // 如果不是楼层模式或已选中楼栋，不显示标签
    if (mode !== 'floor' || currentBuilding) return []

    const list: { name: string; position: [number, number, number] }[] = []
    
    // 遍历场景，查找楼顶对象
    scene.traverse((obj) => {
      if (obj.name.includes('楼顶')) {
        const parentName = obj.parent?.name || '' // 获取父对象名称（楼栋名）
        const worldPos = new THREE.Vector3()
        obj.getWorldPosition(worldPos) // 获取世界坐标
        
        list.push({
          name: parentName,
          position: [worldPos.x, worldPos.y, worldPos.z],
        })
      }
    })
    return list
  }, [mode, scene, currentBuilding])

  return (
    <>
      {labels.map((label, index) => (
        <Html
          key={`bldg-${index}`}
          position={label.position} // 标签位置（楼顶）
          center // 居中对齐
          zIndexRange={[100, 0]}
        >
          <div
            className='cursor-pointer animate-bounce' // 鼠标指针 + 弹跳动画
            onClick={(e) => {
              e.stopPropagation()
              onSelect(label.name, label.position) // 触发选择回调
            }}
          >
            {/* 标签主体 */}
            <div className='bg-blue-600/80 text-white px-3 py-1 rounded-full border border-white/50 shadow-lg text-sm font-bold whitespace-nowrap backdrop-blur-sm'>
              {label.name}
            </div>
            {/* 指向箭头 */}
            <div className='w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600/80 mx-auto'></div>
          </div>
        </Html>
      ))}
    </>
  )
}
