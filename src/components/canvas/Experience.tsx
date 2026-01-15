import { OrbitControls } from '@react-three/drei'
import { CommunityModel } from './CommunityModel'
import { Effects } from './Effects'
import { useRef } from 'react'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/**
 * 3D场景体验组件
 * 负责设置场景的灯光、相机控制和后期处理效果
 */
export const Experience = () => {
  // 轨道控制器引用，用于相机动画控制
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      {/* 设置场景背景色为黑色 */}
      <color attach="background" args={['#000000']} />
      
      {/* 环境光：提供基础照明，颜色偏蓝紫色营造夜晚氛围 */}
      <ambientLight intensity={0.4} color="#6d78b0" />
      
      {/* 平行光：模拟月光，产生阴影效果 */}
      <directionalLight
        position={[100, 100, -100]} // 光源位置
        intensity={0.5} // 光照强度
        castShadow // 启用阴影投射
        shadow-mapSize={[1024, 1024]} // 阴影贴图分辨率
        shadow-camera-near={0.5} // 阴影相机近裁剪面
        shadow-camera-far={500} // 阴影相机远裁剪面
        shadow-camera-left={-100} // 阴影相机左边界
        shadow-camera-right={100} // 阴影相机右边界
        shadow-camera-top={100} // 阴影相机上边界
        shadow-camera-bottom={-100} // 阴影相机下边界
        shadow-bias={0.05} // 阴影偏移，防止阴影失真
        shadow-normalBias={0.05} // 法线偏移
      />

      {/* 轨道控制器：允许用户通过鼠标控制相机 */}
      <OrbitControls
        ref={controlsRef}
        makeDefault // 设为默认控制器
        enableDamping // 启用阻尼效果，使相机移动更平滑
        enableZoom // 允许缩放
        enablePan // 允许平移
        minDistance={1} // 最小缩放距离
        maxDistance={100} // 最大缩放距离
        minPolarAngle={0} // 最小垂直旋转角度
        maxPolarAngle={Math.PI / 2} // 最大垂直旋转角度（限制不能看到地面以下）
        target={[-9.94, 1.36, 3.18]} // 相机注视点
      />

      {/* 社区3D模型组件 */}
      <CommunityModel controlsRef={controlsRef} />
      
      {/* 后期处理效果：辉光和轮廓高亮 */}
      <Effects />
    </>
  )
}
