import { Html } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useCameraAnimation } from '../../hooks/useCameraAnimation'
import { useSceneSetup } from '../../hooks/useSceneSetup'
import { useStore } from '../../store/useStore'
import { Tooltip } from '../ui/Tooltip'
import { Atmosphere } from './Atmosphere'
import { BuildingLabels } from './BuildingLabels'
import { FloorManager } from './FloorManager'

/**
 * 社区模型组件属性接口
 */
interface CommunityModelProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null> // 轨道控制器引用
}

/**
 * 社区3D模型主组件
 * 负责处理场景交互、模式切换、材质变化和标签显示
 * 
 * 功能：
 * - 默认模式：显示完整社区
 * - 水力监测模式：高亮水管，显示水流数据
 * - 电力监测模式：高亮电表，显示电力数据
 * - 楼层管理模式：支持楼栋和楼层的选择与展开
 */
export const CommunityModel = ({ controlsRef }: CommunityModelProps) => {
  // 获取场景设置和材质
  const { scene, transparentMaterial, originalMaterials, restoreMaterials } =
    useSceneSetup()
  
  // 获取全局状态和方法
  const {
    mode,
    setTooltip,
    clearSelectedObjects,
    addSelectedObject,
    setCurrentBuilding,
    setBuildingLayers,
    currentBuilding,
    setCurrentLayer,
  } = useStore()
  
  // 获取相机动画函数
  const { flyTo } = useCameraAnimation(controlsRef)

  /**
   * 监测点标签状态
   * 存储水力/电力监测点的位置和信息
   */
  const [monitorLabels, setMonitorLabels] = useState<
    {
      position: [number, number, number]
      name: string
      type: 'water' | 'electric'
    }[]
  >([])

  /**
   * 水管发光材质
   * 用于水力监测模式下高亮水管
   */
  const waterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00ffff, // 青色
        emissive: 0x00ffff, // 自发光颜色
        emissiveIntensity: 2, // 发光强度
        roughness: 0.2, // 粗糙度
        metalness: 0.5, // 金属度
        toneMapped: false, // 禁用色调映射，保持发光效果
      }),
    []
  )

  /**
   * 电表发光材质
   * 用于电力监测模式下高亮电表
   */
  const electricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffaa00, // 橙黄色
        emissive: 0xffaa00,
        emissiveIntensity: 2,
        roughness: 0.2,
        metalness: 0.5,
        toneMapped: false,
      }),
    []
  )

  /**
   * 模式切换效果处理
   * 根据不同模式应用不同的视觉效果和相机位置
   */
  useEffect(() => {
    // 清除之前的选中状态和提示框
    clearSelectedObjects()
    setTooltip({ show: false })

    // 水力监测模式
    if (mode === 'water') {
      // 飞向水管区域
      flyTo([5.14, 6.98, 1.84], [11.71, -0.78, 12.35])
      const labels: {
        position: [number, number, number]
        name: string
        type: 'water' | 'electric'
      }[] = []

      // 遍历场景，处理水管对象
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (!obj.name.includes('水管')) {
            // 非水管对象：应用半透明材质
            obj.material = transparentMaterial
          } else {
            // 水管对象：应用发光材质
            obj.material = waterMaterial
            
            // 计算对象中心点位置（用于放置标签）
            obj.geometry.computeBoundingBox()
            const center = new THREE.Vector3()
            obj.geometry.boundingBox?.getCenter(center)
            obj.localToWorld(center) // 转换为世界坐标

            // 添加标签信息
            labels.push({
              position: [center.x, center.y + 0.5, center.z], // 标签位置稍微上移
              name: obj.name,
              type: 'water',
            })
          }
        }
      })
      setMonitorLabels(labels)
    } 
    // 电力监测模式
    else if (mode === 'electric') {
      // 飞向电表区域
      flyTo([17.05, 5.51, 19.18], [5.68, 1.39, 4.69])
      const labels: {
        position: [number, number, number]
        name: string
        type: 'water' | 'electric'
      }[] = []

      // 遍历场景，处理电表对象
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (!obj.name.includes('电表')) {
            // 非电表对象：应用半透明材质
            obj.material = transparentMaterial
          } else {
            // 电表对象：应用发光材质
            obj.material = electricMaterial
            
            // 计算对象中心点位置
            obj.geometry.computeBoundingBox()
            const center = new THREE.Vector3()
            obj.geometry.boundingBox?.getCenter(center)
            obj.localToWorld(center)

            // 添加标签信息
            labels.push({
              position: [center.x, center.y + 0.5, center.z],
              name: obj.name,
              type: 'electric',
            })
          }
        }
      })
      setMonitorLabels(labels)
    } 
    // 楼层管理模式
    else if (mode === 'floor') {
      setMonitorLabels([])
      // 飞向俯视角度
      flyTo([18.31, 41.48, 32.01], [17.38, -3.54, 1.71])
      // 恢复所有对象的原始材质
      restoreMaterials()
    } 
    // 默认模式
    else {
      setMonitorLabels([])
      restoreMaterials()
      // 飞回默认视角
      flyTo([68, 27, 47], [-9.94, 1.36, 3.18])
      setCurrentBuilding(null)

      // 将所有对象恢复到初始位置（用于楼层展开后的复位）
      scene.traverse((obj) => {
        if (obj.userData.initialPosition) {
          gsap.to(obj.position, {
            x: obj.userData.initialPosition.x,
            y: obj.userData.initialPosition.y,
            z: obj.userData.initialPosition.z,
            duration: 0.5,
          })
        }
      })
    }
  }, [
    mode,
    scene,
    transparentMaterial,
    originalMaterials,
    flyTo,
    clearSelectedObjects,
    setTooltip,
    restoreMaterials,
    setCurrentBuilding,
    waterMaterial,
    electricMaterial,
  ])

  /**
   * 处理楼栋选择
   * 当用户点击楼栋标签时调用
   * 
   * @param buildingName - 楼栋名称（如"1号楼"）
   * @param position - 楼栋位置
   */
  const handleBuildingSelect = (
    buildingName: string,
    position: [number, number, number]
  ) => {
    setCurrentBuilding(buildingName)

    // 相机飞向选中的楼栋
    flyTo(
      [position[0] + 10, position[1] + 20, position[2] + 10],
      [position[0], position[1], position[2]]
    )

    // 遍历场景，只显示选中楼栋，其他对象半透明
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        // 检查对象是否属于选中的楼栋
        let isTarget = false
        let curr: THREE.Object3D | null = obj
        while (curr) {
          if (curr.name === buildingName) {
            isTarget = true
            break
          }
          curr = curr.parent
        }

        if (isTarget) {
          // 属于选中楼栋：恢复原始材质
          if (originalMaterials.has(obj.uuid)) {
            obj.material = originalMaterials.get(obj.uuid)!
          }
        } else {
          // 不属于选中楼栋：应用半透明材质
          obj.material = transparentMaterial
        }
      }
    })

    // 获取楼栋的所有楼层，并排序
    const buildingObj = scene.getObjectByName(buildingName)
    if (buildingObj) {
      const layers = buildingObj.children
        .filter((child) => child.name.includes('F')) // 筛选包含"F"的楼层
        .map((child) => child.name)
        .sort((a, b) => {
          // 按楼层数字排序（1F, 2F, 3F...）
          const matchA = a.match(/(\d+)F/)
          const matchB = b.match(/(\d+)F/)
          const numA = matchA ? parseInt(matchA[1]) : 0
          const numB = matchB ? parseInt(matchB[1]) : 0
          return numA - numB
        })
      // 设置楼层列表，"全楼"选项放在最前面
      setBuildingLayers(['全楼', ...layers])
    }
  }

  /**
   * 处理3D对象点击事件
   * 根据当前模式执行不同的交互逻辑
   */
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const obj = e.object as THREE.Mesh

    // 监测模式交互：点击水管或电表
    if (mode === 'water' && obj.name.includes('水管')) {
      handleMonitorClick(e, obj, '水', 20) // 模拟水流量20 t/h
      return
    } else if (mode === 'electric' && obj.name.includes('电表')) {
      handleMonitorClick(e, obj, '电', 480) // 模拟电功率480 kW
      return
    }

    // 楼层模式交互：点击楼层切换
    if (mode === 'floor' && currentBuilding) {
      // 检查点击的对象是否属于当前楼栋
      let isChild = false
      let curr: THREE.Object3D | null = obj
      while (curr) {
        if (curr.name === currentBuilding) {
          isChild = true
          break
        }
        curr = curr.parent
      }

      if (isChild) {
        // 查找对象所属的楼层
        // 场景结构：楼栋 -> 楼层 -> 网格
        // 或：楼栋 -> 网格（网格名称包含F）
        let floorName = ''
        if (obj.name.includes('F')) floorName = obj.name
        else if (obj.parent?.name.includes('F')) floorName = obj.parent.name

        if (floorName) {
          setCurrentLayer(floorName)
        }
      }
    }
  }

  /**
   * 处理监测点点击
   * 显示监测点的详细信息
   * 
   * @param e - 点击事件
   * @param obj - 被点击的3D对象
   * @param type - 监测类型（水/电）
   * @param value - 监测数值
   */
  const handleMonitorClick = (
    e: ThreeEvent<MouseEvent>,
    obj: THREE.Mesh,
    type: string,
    value: number
  ) => {
    // 清除之前的选中，添加新选中（用于轮廓高亮）
    clearSelectedObjects()
    addSelectedObject(obj.uuid)

    // 提取位置信息（楼栋、楼层、房间）
    const floorName = obj.parent?.parent?.name || ''
    const layerName = obj.parent?.name.substring(0, 2) || ''
    const roomName = obj.name.substring(0, 3) || ''

    // 显示提示框
    setTooltip({
      show: true,
      floor: floorName,
      layer: layerName,
      room: roomName,
      value: value,
      name: obj.name,
      type: type,
      x: e.clientX,
      y: e.clientY,
      position: [e.point.x, e.point.y, e.point.z],
    })
  }

  /**
   * 处理点击空白区域
   * 清除选中状态和提示框
   */
  const handlePointerMissed = () => {
    if (mode !== 'floor') {
      setTooltip({ show: false })
      clearSelectedObjects()
    }
  }

  return (
    <group>
      {/* 大气效果：星空、流星、浮动光球 */}
      <Atmosphere />

      {/* 3D场景对象 */}
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerMissed={handlePointerMissed}
      />

      {/* 楼栋标签组件 */}
      <BuildingLabels
        scene={scene}
        onSelect={handleBuildingSelect}
      />
      
      {/* 楼层管理组件 */}
      <FloorManager
        scene={scene}
        flyTo={flyTo}
        originalMaterials={originalMaterials}
      />
      
      {/* 3D提示框 */}
      <Tooltip />

      {/* 监测点标签：显示水管/电表名称 */}
      {monitorLabels.map((label, i) => (
        <Html
          key={i}
          position={label.position}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`
                  px-2 py-1 rounded text-xs font-bold border backdrop-blur-sm shadow-sm opacity-80
                  ${
                    label.type === 'electric'
                      ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30'
                      : 'bg-blue-900/40 text-blue-200 border-blue-500/30'
                  }
              `}
          >
            {label.name}
          </div>
        </Html>
      ))}
    </group>
  )
}
