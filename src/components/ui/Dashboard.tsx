import React from 'react'
import ReactECharts from 'echarts-for-react'
import { clsx } from 'clsx'

const Card = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={clsx("bg-black/60 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 pointer-events-auto", className)}>
    <h3 className="text-blue-300 font-bold mb-3 border-b border-blue-500/30 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
      <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
      {title}
    </h3>
    {children}
  </div>
)

export const Dashboard = () => {
  // Chart 1: Energy Consumption (Line Chart)
  const energyOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['电力 (kW)', '水流 (t/h)'],
      textStyle: { color: '#9ca3af' },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#4b5563' } },
      axisLabel: { color: '#9ca3af' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
      axisLabel: { color: '#9ca3af' }
    },
    series: [
      {
        name: '电力 (kW)',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#eab308' }, // yellow-500
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(234,179,8,0.3)' }, { offset: 1, color: 'rgba(234,179,8,0)' }]
          }
        }
      },
      {
        name: '水流 (t/h)',
        type: 'line',
        smooth: true,
        data: [22, 18, 19, 23, 29, 33, 31],
        itemStyle: { color: '#3b82f6' }, // blue-500
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]
          }
        }
      }
    ]
  }

  // Chart 2: Alert Statistics (Pie Chart)
  const alertOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      left: 'right',
      textStyle: { color: '#9ca3af' }
    },
    series: [
      {
        name: '告警分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#000',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: { show: false },
        data: [
          { value: 12, name: '设备故障', itemStyle: { color: '#ef4444' } }, // red
          { value: 5, name: '水管泄漏', itemStyle: { color: '#3b82f6' } },  // blue
          { value: 8, name: '电力过载', itemStyle: { color: '#eab308' } },  // yellow
          { value: 20, name: '正常运行', itemStyle: { color: '#22c55e' } }  // green
        ]
      }
    ]
  }

  // Chart 3: Traffic Statistics (Bar Chart)
  const trafficOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af' }
      }
    ],
    yAxis: [
      {
        type: 'value',
        splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        axisLabel: { color: '#9ca3af' }
      }
    ],
    series: [
      {
        name: '人流量',
        type: 'bar',
        emphasis: { focus: 'series' },
        data: [320, 332, 301, 334, 390, 330, 320],
        itemStyle: { color: '#8b5cf6' } // violet
      },
      {
        name: '车流量',
        type: 'bar',
        stack: 'Ad',
        emphasis: { focus: 'series' },
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#06b6d4' } // cyan
      }
    ]
  }

  return (
    <>
      {/* Left Panel */}
      <div className="absolute top-[15%] left-4 w-80 flex flex-col gap-4">
        <Card title="社区能耗趋势" className="h-64">
          <ReactECharts option={energyOption} style={{ height: '100%', width: '100%' }} />
        </Card>
        
        <div className="grid grid-cols-2 gap-2">
           <Card title="今日访客" className="h-24 flex flex-col justify-center items-center">
             <span className="text-2xl font-bold text-white">1,284</span>
             <span className="text-xs text-green-400">↑ 12%</span>
           </Card>
           <Card title="在线设备" className="h-24 flex flex-col justify-center items-center">
             <span className="text-2xl font-bold text-white">482</span>
             <span className="text-xs text-blue-400">98% 在线</span>
           </Card>
        </div>
      </div>

      {/* Right Panel */}
      <div className="absolute top-[15%] right-4 w-80 flex flex-col gap-4">
        <Card title="实时告警统计" className="h-56">
          <ReactECharts option={alertOption} style={{ height: '100%', width: '100%' }} />
        </Card>
        <Card title="人车流量监控" className="h-56">
          <ReactECharts option={trafficOption} style={{ height: '100%', width: '100%' }} />
        </Card>
      </div>
    </>
  )
}
