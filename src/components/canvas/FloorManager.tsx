import { Html } from '@react-three/drei'
import gsap from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

/**
 * 楼层管理器组件属性接口
 */
interface FloorManagerProps {
  scene: THREE.Group // 3D场景对象
  flyTo: ( // 相机飞行函数
    pos: [number, number, number],
    target: [number, number, number],
    duration?: number
  ) => void
  originalMaterials: Map<string, THREE.Material | THREE.Material[]> // 原始材质映射
}

/**
 * 楼层管理器组件
 * 负责楼层的展开/收起动画、材质切换和楼层信息标签显示
 * 
 * 功能：
 * - 选中楼层时，将上方楼层向上移动，形成"爆炸视图"效果
 * - 高亮显示选中楼层，其他楼层变暗
 * - 显示楼层详细信息（入住率、温度、状态等）
 * - 相机自动聚焦到选中楼层
 */
export const FloorManager = ({
  scene,
  flyTo,
  originalMaterials,
}: FloorManagerProps) => {
  const { mode, currentBuilding, currentLayer, setCurrentLayer } = useStore()
  
  // 楼层标签数据
  const [floorLabels, setFloorLabels] = useState<
    { name: string; position: [number, number, number]; data: any }[]
  >([])
  
  // 鼠标悬停的标签
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  /**
   * 暗淡材质
   * 用于非选中楼层，使其变暗以突出选中楼层
   */
  const dimmedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, // 深灰色
        transparent: true,
        opacity: 0.3, // 半透明
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  )

  /**
   * 楼层展开和材质切换逻辑
   * 当选中楼层变化时触发
   */
  useEffect(() => {
    // 如果不在楼层模式或未选中楼栋，清空标签
    if (mode !== 'floor' || !currentBuilding) {
      if (floorLabels.length > 0) setFloorLabels([])
      return
    }

    const buildingObj = scene.getObjectByName(currentBuilding)
    if (!buildingObj) return

    /**
     * 从楼层名称中提取楼层数字
     * 例如："1F" -> 1, "2F" -> 2
     */
    const getFloorNum = (name: string) => {
      const match = name.match(/(\d+)F/)
      return match ? parseInt(match[1]) : NaN
    }

    const targetLayerNum = getFloorNum(currentLayer)
    
    // 查找最高楼层数（用于楼顶定位）
    let maxFloor = 0
    buildingObj.children.forEach((child) => {
      const f = getFloorNum(child.name)
      if (!isNaN(f) && f > maxFloor) maxFloor = f
    })

    const newLabels: {
      name: string
      position: [number, number, number]
      data: any
    }[] = []

    // 遍历楼栋的所有子对象（楼层）
    buildingObj.children.forEach((mesh) => {
      if (!(mesh instanceof THREE.Mesh)) return

      const initialPos = mesh.userData.initialPosition
      if (!initialPos) return

      let targetY = initialPos.y // 目标Y坐标
      let shouldShowLabel = false // 是否显示标签
      const meshFloorNum = getFloorNum(mesh.name)

      // === 动画和位置逻辑 ===
      if (currentLayer === '全楼') {
        // 全楼视图：所有楼层恢复初始位置
        targetY = initialPos.y
        // 恢复原始材质
        if (originalMaterials.has(mesh.uuid)) {
          mesh.material = originalMaterials.get(mesh.uuid)!
        }
      } else {
        // 单楼层视图：计算楼层间距
        let floorDiff = 0
        
        if (!isNaN(targetLayerNum)) {
           if (mesh.name.includes('楼顶')) {
             // 楼顶视为最高楼层+1
             floorDiff = (maxFloor + 1) - targetLayerNum
           } else if (!isNaN(meshFloorNum)) {
             // 计算当前楼层与目标楼层的差值
             floorDiff = meshFloorNum - targetLayerNum
           }
        }

        // 将选中楼层上方的楼层向上移动
        if (floorDiff >= 1) {
             // 阶梯式偏移：每层向上移动30个单位
             targetY = initialPos.y + floorDiff * 30 
        } else {
             // 选中楼层及以下保持原位
             targetY = initialPos.y
        }
        
        // 如果是选中的楼层，显示标签
        if (!isNaN(meshFloorNum) && meshFloorNum === targetLayerNum) {
            shouldShowLabel = true
        }

        // === 材质逻辑 ===
        if (meshFloorNum === targetLayerNum) {
          // 选中楼层：恢复原始材质（高亮）
          if (originalMaterials.has(mesh.uuid)) {
            mesh.material = originalMaterials.get(mesh.uuid)!
          }
        } else {
          // 其他楼层：应用暗淡材质
          mesh.material = dimmedMaterial
        }
      }

      // 使用GSAP动画平滑移动楼层
      gsap.to(mesh.position, {
        y: targetY,
        duration: 0.8,
        ease: 'power3.inOut', // 平滑缓动
      })

      // 如果需要显示标签，添加到标签列表
      if (shouldShowLabel) {
        // 计算标签的世界坐标位置
        const targetLocalPos = new THREE.Vector3(
          mesh.position.x,
          targetY,
          mesh.position.z
        )
        // 转换为世界坐标
        targetLocalPos.applyMatrix4(buildingObj.matrixWorld)

        newLabels.push({
          name: mesh.name,
          position: [targetLocalPos.x, targetLocalPos.y, targetLocalPos.z],
          data: {
            occupancy: Math.floor(60 + Math.random() * 40) + '%', // 模拟入住率
            temp: (20 + Math.random() * 5).toFixed(1) + '°C', // 模拟温度
            status: '正常', // 设施状态
          },
        })
      }
    })

    setFloorLabels(newLabels)

    // === 相机聚焦逻辑 ===
    if (currentLayer !== '全楼') {
      // 单楼层视图：聚焦到选中楼层
      const layerObj = buildingObj.children.find(
        (child) => child.name === currentLayer
      )
      if (layerObj) {
        const initialPos = layerObj.userData.initialPosition
        if (initialPos && !isNaN(initialPos.x)) {
          const finalWorldPos = initialPos
            .clone()
            .applyMatrix4(buildingObj.matrixWorld)
          if (!isNaN(finalWorldPos.x)) {
            flyTo(
              [
                finalWorldPos.x + 25,
                finalWorldPos.y + 15,
                finalWorldPos.z + 25,
              ],
              [finalWorldPos.x, finalWorldPos.y, finalWorldPos.z],
              1.2 // 动画时长1.2秒
            )
          }
        }
      }
    } else {
      // 全楼视图：聚焦到楼栋中心
      const worldPos = new THREE.Vector3()
      buildingObj.getWorldPosition(worldPos)
      if (!isNaN(worldPos.x)) {
        flyTo(
          [worldPos.x + 40, worldPos.y + 50, worldPos.z + 40],
          [worldPos.x, worldPos.y, worldPos.z]
        )
      }
    }
  }, [
    currentLayer,
    currentBuilding,
    mode,
    scene,
    flyTo,
    originalMaterials,
    dimmedMaterial,
  ])

  // 如果不在楼层模式或未选中楼栋，不渲染
  if (mode !== 'floor' || !currentBuilding) return null

  return (
    <>
      {floorLabels.map((label, index) => (
        <Html
          key={`floor-${index}`}
          position={label.position}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }} // 外层禁用鼠标事件
        >
          <div
            className='relative pointer-events-auto cursor-pointer' // 内层启用鼠标事件
            onMouseEnter={() => setHoveredLabel(label.name)}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => setCurrentLayer(label.name)}
          >
            {/* 楼层标签徽章 */}
            <div
              className={`
                flex items-center justify-center
                px-4 py-1.5 rounded-full text-sm font-bold tracking-wide
                border backdrop-blur-md transition-all duration-300 shadow-lg select-none
                ${
                  hoveredLabel === label.name
                    ? 'bg-blue-600/90 text-white border-blue-400 scale-110 shadow-blue-500/50'
                    : 'bg-slate-900/60 text-blue-100 border-white/20 hover:bg-slate-800/80'
                }
            `}
            >
              <span className='mr-1'>🏢</span> {label.name}
            </div>

            {/* 详细信息提示框（悬停时显示） */}
            <div
              className={`
                absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 
                bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 
                shadow-2xl backdrop-blur-xl transition-all duration-300 origin-bottom
                ${
                  hoveredLabel === label.name
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }
            `}
            >
              {/* 标题 */}
              <div className='text-xs font-semibold text-slate-400 mb-2 border-b border-white/10 pb-1'>
                楼层详情
              </div>
              
              {/* 详细数据 */}
              <div className='space-y-1.5 text-xs'>
                {/* 入住率（带进度条） */}
                <div className='flex justify-between items-center'>
                  <span className='text-slate-400'>入住率</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-500'
                        style={{ width: label.data.occupancy }}
                      ></div>
                    </div>
                    <span className='font-mono text-blue-300'>
                      {label.data.occupancy}
                    </span>
                  </div>
                </div>
                
                {/* 环境温度 */}
                <div className='flex justify-between'>
                  <span className='text-slate-400'>环境温度</span>
                  <span className='font-mono text-yellow-300'>
                    {label.data.temp}
                  </span>
                </div>
                
                {/* 设施状态 */}
                <div className='flex justify-between'>
                  <span className='text-slate-400'>设施状态</span>
                  <span className='text-green-400 font-medium'>
                    {label.data.status}
                  </span>
                </div>
              </div>

              {/* 装饰性箭头 */}
              <div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900/95'></div>
            </div>

            {/* 引导线（连接标签和楼层） */}
            <div
              className={`
                absolute left-1/2 top-full -translate-x-1/2 w-px bg-gradient-to-b from-blue-500/80 to-transparent transition-all duration-300
                ${hoveredLabel === label.name ? 'h-16' : 'h-8 opacity-50'}
            `}
            />
          </div>
        </Html>
      ))}
    </>
  )
}
