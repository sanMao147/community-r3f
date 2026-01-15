// 导入React Three Fiber相关组件
import { Loader } from '@react-three/drei' // 加载器组件
import { Canvas } from '@react-three/fiber' // 3D画布组件
import { Leva } from 'leva' // 调试面板
import { Suspense } from 'react'
import { Experience } from './components/canvas/Experience' // 3D场景体验组件
import { Overlay } from './components/ui/Overlay' // UI覆盖层组件

/**
 * 应用主组件
 * 负责初始化3D画布和UI界面
 */
function App() {
  return (
    <>
      <div className='relative w-full h-full bg-black'>
        {/* 3D渲染画布 */}
        <Canvas
          shadows // 启用阴影
          camera={{ position: [68, 27, 47], fov: 45 }} // 相机初始位置和视野角度
          gl={{
            antialias: true, // 启用抗锯齿
            toneMappingExposure: 0.895, // 色调映射曝光度
          }}
          dpr={[1, 2]} // 设备像素比，支持高清屏幕
        >
          {/* 使用Suspense包裹异步加载的3D内容 */}
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>

        {/* UI覆盖层：包含控制按钮和数据面板 */}
        <Overlay />
        
        {/* 模型加载进度条 */}
        <Loader />
        
        {/* Leva调试面板（默认折叠） */}
        <Leva collapsed />
      </div>
    </>
  )
}

export default App
