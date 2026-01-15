import { clsx } from 'clsx'
import { AppMode, useStore } from '../../store/useStore'
import { Dashboard } from './Dashboard'

/**
 * UI覆盖层组件
 * 包含顶部标题、底部控制按钮和楼层选择面板
 */
export const Overlay = () => {
  const {
    mode,
    setMode,
    currentBuilding,
    setCurrentLayer,
    currentLayer,
    buildingLayers,
  } = useStore()

  // 定义所有模式按钮
  const buttons: { id: AppMode; label: string }[] = [
    { id: 'default', label: '默认视角' },
    { id: 'water', label: '水力监测' },
    { id: 'electric', label: '电力监测' },
    { id: 'floor', label: '楼层管理' },
  ]

  return (
    <div className='absolute inset-0 pointer-events-none'>
      {/* 数据面板：在默认、水力和电力模式下显示 */}
      {(mode === 'default' || mode === 'water' || mode === 'electric') && (
        <Dashboard mode={mode} />
      )}
      
      {/* 楼层控制面板：仅在楼层管理模式且选中楼栋时显示 */}
      {mode === 'floor' && currentBuilding && (
        <div className='absolute top-[20%] right-[10%] w-32 bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 pointer-events-auto flex flex-col gap-2 max-h-[60vh] overflow-y-auto'>
          {/* 楼栋名称标题 */}
          <div className='text-blue-300 text-center font-bold mb-2 pb-2 border-b border-blue-500/30'>
            {currentBuilding}
          </div>
          {/* 楼层按钮列表 */}
          {buildingLayers.map((layer) => (
            <button
              key={layer}
              onClick={() => setCurrentLayer(layer)}
              className={clsx(
                'py-1.5 px-3 rounded text-sm transition-all duration-200',
                currentLayer === layer
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' // 选中状态：蓝色高亮
                  : 'text-gray-300 hover:bg-white/10' // 未选中状态：灰色，悬停变亮
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      )}

      {/* 底部控制栏：模式切换按钮 */}
      <div className='absolute bottom-8 left-0 w-full flex justify-center gap-4 pointer-events-auto'>
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setMode(btn.id)}
            className={clsx(
              'px-6 py-2 rounded-full text-white font-medium transition-all duration-300 backdrop-blur-md border',
              mode === btn.id
                ? 'bg-blue-600/80 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]' // 当前模式：蓝色发光
                : 'bg-black/50 border-white/20 hover:bg-black/70 hover:border-white/40' // 其他模式：半透明黑色
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 顶部标题栏 */}
      <div className='absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none'>
        <h1 className='text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-wider'>
          3D 智慧社区可视化
        </h1>
      </div>
    </div>
  )
}
