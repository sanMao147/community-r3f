import { Float, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * 流星组件
 * 创建多个流星实例，模拟夜空中的流星效果
 * 
 * @param count - 流星数量，默认20个
 */
const Meteors = ({ count = 20 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null) // 实例化网格引用
  const dummy = useMemo(() => new THREE.Object3D(), []) // 虚拟对象，用于计算每个实例的变换

  /**
   * 流星粒子数据
   * 每个流星有独立的速度、位置、大小和时间偏移
   */
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const speed = 0.5 + Math.random() * 2 // 随机速度
      // 在广阔区域上方随机生成起始位置
      const x = (Math.random() - 0.5) * 300
      const y = 80 + Math.random() * 50
      const z = (Math.random() - 0.5) * 300
      const size = 0.5 + Math.random() * 1.5 // 随机大小
      temp.push({ speed, x, y, z, size, offset: Math.random() * 100 })
    }
    return temp
  }, [count])

  /**
   * 每帧更新流星位置和状态
   */
  useFrame((state) => {
    if (!mesh.current) return

    particles.forEach((particle, i) => {
      // 基于时间计算当前位置
      const time =
        state.clock.getElapsedTime() * particle.speed + particle.offset
      // 每8秒循环一次
      const loopTime = 8
      const t = (time % loopTime) / loopTime

      // 起始位置
      const startX = particle.x
      const startY = particle.y
      const startZ = particle.z

      // 结束位置（对角线下落）
      const endX = startX - 100
      const endY = startY - 100

      // 当前位置（线性插值）
      const cx = THREE.MathUtils.lerp(startX, endX, t)
      const cy = THREE.MathUtils.lerp(startY, endY, t)

      dummy.position.set(cx, cy, startZ)

      // 旋转：指向运动方向（对角线）
      dummy.rotation.z = Math.PI / 4

      // 缩放：拉伸成流星尾巴效果
      const scale = particle.size
      dummy.scale.set(scale * 0.2, scale * 8, scale * 0.2) // Y轴拉长

      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)

      // 淡入淡出效果：在开始和结束时隐藏
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
      {/* 圆柱体几何体，用于流星尾巴 */}
      <cylinderGeometry args={[0.2, 0.05, 1, 8]} />
      {/* 发光材质 */}
      <meshBasicMaterial
        color='#aaddff' // 淡蓝色
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending} // 加法混合，产生发光效果
      />
    </instancedMesh>
  )
}

/**
 * 浮动光球组件
 * 创建多个缓慢浮动的发光球体，增加场景氛围
 */
const FloatingOrbs = () => {
  return (
    <group>
      {[...Array(8)].map((_, i) => (
        <Float
          key={i}
          speed={0.5 + Math.random()} // 随机浮动速度
          rotationIntensity={0.5} // 旋转强度
          floatIntensity={10} // 浮动强度
          floatingRange={[20, 60]} // 浮动高度范围
        >
          <mesh
            position={[
              (Math.random() - 0.5) * 200, // 随机X位置
              30, // 固定高度
              (Math.random() - 0.5) * 200, // 随机Z位置
            ]}
          >
            <sphereGeometry args={[0.8, 16, 16]} />
            {/* 高亮发光材质 */}
            <meshBasicMaterial
              color={[1.2, 1.5, 3]} // RGB值超过1，产生HDR效果
              toneMapped={false} // 禁用色调映射
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

/**
 * 大气效果组件
 * 组合星空、流星和浮动光球，营造夜晚氛围
 */
export const Atmosphere = () => {
  return (
    <group>
      {/* 星空背景 */}
      <Stars
        radius={200} // 星空半径
        depth={50} // 星空深度
        count={5000} // 星星数量
        factor={4} // 星星大小因子
        saturation={0} // 饱和度（0为白色）
        fade // 启用淡入淡出
        speed={0.5} // 旋转速度
      />
      
      {/* 流星效果 */}
      <Meteors count={30} />
      
      {/* 浮动光球 */}
      <FloatingOrbs />
      
      {/* 环境光：为整个场景添加微弱的蓝色基调 */}
      <ambientLight
        intensity={0.2}
        color='#001133' // 深蓝色
      />
    </group>
  )
}
