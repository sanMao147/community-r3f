import { clsx } from 'clsx'
import { AppMode, useStore } from '../../store/useStore'
import { Dashboard } from './Dashboard'

export const Overlay = () => {
  const {
    mode,
    setMode,
    currentBuilding,
    setCurrentLayer,
    currentLayer,
    buildingLayers,
  } = useStore()

  const buttons: { id: AppMode; label: string }[] = [
    { id: 'default', label: '默认视角' },
    { id: 'water', label: '水力监测' },
    { id: 'electric', label: '电力监测' },
    { id: 'floor', label: '楼层管理' },
  ]

  return (
    <div className='absolute inset-0 pointer-events-none'>
      {/* Dashboard for Default, Water, and Electric Mode */}
      {(mode === 'default' || mode === 'water' || mode === 'electric') && (
        <Dashboard mode={mode} />
      )}
      {/* Layer Control Panel */}
      {mode === 'floor' && currentBuilding && (
        <div className='absolute top-[20%] right-[10%] w-32 bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 pointer-events-auto flex flex-col gap-2 max-h-[60vh] overflow-y-auto'>
          <div className='text-blue-300 text-center font-bold mb-2 pb-2 border-b border-blue-500/30'>
            {currentBuilding}
          </div>
          {buildingLayers.map((layer) => (
            <button
              key={layer}
              onClick={() => setCurrentLayer(layer)}
              className={clsx(
                'py-1.5 px-3 rounded text-sm transition-all duration-200',
                currentLayer === layer
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                  : 'text-gray-300 hover:bg-white/10'
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className='absolute bottom-8 left-0 w-full flex justify-center gap-4 pointer-events-auto'>
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setMode(btn.id)}
            className={clsx(
              'px-6 py-2 rounded-full text-white font-medium transition-all duration-300 backdrop-blur-md border',
              mode === btn.id
                ? 'bg-blue-600/80 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-black/50 border-white/20 hover:bg-black/70 hover:border-white/40'
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Title / Header */}
      <div className='absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none'>
        <h1 className='text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-wider'>
          3D 智慧社区可视化
        </h1>
      </div>
    </div>
  )
}
