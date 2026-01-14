import { Html } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import { useMemo } from 'react'
import * as THREE from 'three'

interface BuildingLabelsProps {
  scene: THREE.Group
  onSelect: (name: string, position: [number, number, number]) => void
}

export const BuildingLabels = ({ scene, onSelect }: BuildingLabelsProps) => {
  const { mode, currentBuilding } = useStore()
  
  const labels = useMemo(() => {
    if (mode !== 'floor' || currentBuilding) return []

    const list: { name: string; position: [number, number, number] }[] = []
    scene.traverse((obj) => {
      if (obj.name.includes('楼顶')) {
        const parentName = obj.parent?.name || ''
        const worldPos = new THREE.Vector3()
        obj.getWorldPosition(worldPos)
        list.push({
          name: parentName,
          position: [worldPos.x, worldPos.y, worldPos.z],
        })
      }
    })
    return list
  }, [mode, scene, currentBuilding])

  return (
    <>
      {labels.map((label, index) => (
        <Html
          key={`bldg-${index}`}
          position={label.position}
          center
          zIndexRange={[100, 0]}
        >
          <div
            className='cursor-pointer animate-bounce'
            onClick={(e) => {
              e.stopPropagation()
              onSelect(label.name, label.position)
            }}
          >
            <div className='bg-blue-600/80 text-white px-3 py-1 rounded-full border border-white/50 shadow-lg text-sm font-bold whitespace-nowrap backdrop-blur-sm'>
              {label.name}
            </div>
            <div className='w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600/80 mx-auto'></div>
          </div>
        </Html>
      ))}
    </>
  )
}
