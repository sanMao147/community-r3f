import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { RefObject, useCallback, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/**
 * 相机动画Hook
 * 提供平滑的相机飞行动画功能
 * 
 * @param controlsRef - 轨道控制器引用
 * @returns flyTo函数，用于执行相机飞行动画
 */
export const useCameraAnimation = (controlsRef: RefObject<OrbitControlsImpl | null>) => {
  const { camera } = useThree() // 获取Three.js相机对象
  const timelineRef = useRef<gsap.core.Timeline | null>(null) // GSAP时间轴引用

  /**
   * 相机飞行到指定位置和目标点
   * 
   * @param position - 相机目标位置 [x, y, z]
   * @param target - 相机注视目标点 [x, y, z]
   * @param duration - 动画持续时间（秒），默认1.5秒
   * @param onComplete - 动画完成回调函数
   */
  const flyTo = useCallback(
    (
      position: [number, number, number],
      target: [number, number, number],
      duration = 1.5,
      onComplete?: () => void
    ) => {
      if (!controlsRef.current) return

      // 如果有正在运行的动画，先终止它
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      // 动画期间禁用用户控制
      controlsRef.current.enabled = false

      // 创建GSAP时间轴
      const tl = gsap.timeline({
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true // 动画完成后重新启用控制
            controlsRef.current.update() // 确保控制器状态正确更新
          }
          onComplete?.() // 执行回调
          timelineRef.current = null
        },
      })
      
      timelineRef.current = tl

      // 动画：相机位置移动
      tl.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration,
        ease: 'power3.inOut', // 使用平滑的缓动函数
      })

      // 动画：相机注视点移动（与位置动画同时进行）
      tl.to(
        controlsRef.current.target,
        {
          x: target[0],
          y: target[1],
          z: target[2],
          duration,
          ease: 'power3.inOut',
          onUpdate: () => {
             // 每帧更新控制器，确保相机和目标点同步
             controlsRef.current?.update()
          }
        },
        '<' // '<'表示与上一个动画同时开始
      )
    },
    [camera, controlsRef]
  )

  return { flyTo }
}
