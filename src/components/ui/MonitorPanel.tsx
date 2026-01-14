import ReactECharts from 'echarts-for-react'
import { useStore } from '../../store/useStore'

export const MonitorPanel = () => {
  const { activeMonitor, setActiveMonitor } = useStore()

  if (!activeMonitor) return null

  const isElectric = activeMonitor.type === '电'
  const themeColor = isElectric ? 'text-yellow-400' : 'text-blue-400'
  const borderColor = isElectric ? 'border-yellow-500/30' : 'border-blue-500/30'
  
  // Mock Data Generation
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = Array.from({ length: 24 }, () => 
    Math.floor(Math.random() * (isElectric ? 500 : 30) + (isElectric ? 100 : 5))
  )

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: isElectric ? '#eab308' : '#3b82f6',
      textStyle: { color: '#fff' }
    },
    grid: {
      top: 40,
      right: 20,
      bottom: 20,
      left: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#999' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: '#999' }
    },
    series: [
      {
        name: isElectric ? '用电量' : '用水量',
        type: 'line',
        smooth: true,
        data: data,
        itemStyle: { color: isElectric ? '#eab308' : '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: isElectric ? 'rgba(234,179,8,0.5)' : 'rgba(59,130,246,0.5)' },
              { offset: 1, color: isElectric ? 'rgba(234,179,8,0.0)' : 'rgba(59,130,246,0.0)' }
            ]
          }
        }
      }
    ]
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] bg-black/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-6 z-[10000001] pointer-events-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${borderColor} border`}>
                 {isElectric ? '⚡' : '💧'}
            </div>
            <div>
                <h2 className={`text-xl font-bold ${themeColor} tracking-wide`}>
                    {activeMonitor.name}
                </h2>
                <div className="text-xs text-slate-400 mt-1">设备ID: {activeMonitor.id ? activeMonitor.id.slice(0, 8) : 'Unknown'}...</div>
            </div>
        </div>
        <button 
            onClick={() => setActiveMonitor(null)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-slate-400 text-sm mb-1">当前状态</div>
              <div className="text-green-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  运行正常
              </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-slate-400 text-sm mb-1">实时数值</div>
              <div className={`text-xl font-mono font-bold ${themeColor}`}>
                  {activeMonitor.value} <span className="text-sm text-slate-500">{isElectric ? 'kW' : 't/h'}</span>
              </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-slate-400 text-sm mb-1">今日告警</div>
              <div className="text-white font-bold">0 <span className="text-xs text-slate-500">次</span></div>
          </div>
      </div>

      {/* Chart */}
      <div className={`rounded-lg border ${borderColor} bg-black/20 p-2 h-[300px]`}>
          <div className="text-xs text-slate-400 mb-2 px-2">24小时趋势图</div>
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  )
}
