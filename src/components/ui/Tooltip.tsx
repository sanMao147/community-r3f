import { Html } from '@react-three/drei'
import { clsx } from 'clsx'
import { useStore } from '../../store/useStore'

export const Tooltip = () => {
  const { tooltip } = useStore()

  if (!tooltip.show || !tooltip.position) return null

  const isElectric = tooltip.type === '电'
  const themeColor = isElectric ? 'border-yellow-500' : 'border-blue-500'
  const textColor = isElectric ? 'text-yellow-300' : 'text-blue-300'
  const shadowColor = isElectric
    ? 'shadow-[0_0_10px_rgba(234,179,8,0.5)]'
    : 'shadow-[0_0_10px_rgba(0,190,255,0.5)]'
  const titleBorder = isElectric ? 'border-yellow-500/50' : 'border-blue-500/50'
  const arrowColor = isElectric
    ? 'border-t-yellow-500/80'
    : 'border-t-blue-500/80'

  return (
    <Html
      position={tooltip.position}
      style={{ pointerEvents: 'none', zIndex: 10000000 }}
    >
      <div
        className='pb-4'
        style={{
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none',
        }}
      >
        <div
          className={clsx(
            'bg-black/80 border text-white p-4 rounded-lg backdrop-blur-sm min-w-[200px]',
            themeColor,
            shadowColor
          )}
        >
          <div
            className={clsx(
              'text-lg font-bold mb-2 border-b pb-1 flex items-center gap-2',
              textColor,
              titleBorder
            )}
          >
            {isElectric ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-5 h-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z'
                />
              </svg>
            )}
            {tooltip.name || (isElectric ? '电力监测点' : '水力监测点')}
          </div>
          <div className='space-y-1 text-sm'>
            {tooltip.floor && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>楼栋:</span>
                <span>{tooltip.floor}</span>
              </div>
            )}
            {tooltip.layer && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>楼层:</span>
                <span>{tooltip.layer}</span>
              </div>
            )}
            {tooltip.room && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>房间:</span>
                <span>{tooltip.room}</span>
              </div>
            )}
            {tooltip.value !== undefined && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>
                  {isElectric ? '当前功率' : '当前流量'}:
                </span>
                <span
                  className={clsx(
                    'font-bold',
                    tooltip.value > (isElectric ? 400 : 15)
                      ? 'text-red-500'
                      : 'text-green-500'
                  )}
                >
                  {tooltip.value} {isElectric ? 'kW' : 't/h'}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Arrow */}
        <div
          className={clsx(
            'absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]',
            arrowColor
          )}
        ></div>
      </div>
    </Html>
  )
}
