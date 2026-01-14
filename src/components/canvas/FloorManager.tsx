import { Html } from '@react-three/drei'
import gsap from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

interface FloorManagerProps {
  scene: THREE.Group
  flyTo: (
    pos: [number, number, number],
    target: [number, number, number],
    duration?: number
  ) => void
  originalMaterials: Map<string, THREE.Material | THREE.Material[]>
}

export const FloorManager = ({
  scene,
  flyTo,
  originalMaterials,
}: FloorManagerProps) => {
  const { mode, currentBuilding, currentLayer, setCurrentLayer } = useStore()
  const [floorLabels, setFloorLabels] = useState<
    { name: string; position: [number, number, number]; data: any }[]
  >([])
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)

  // Material for non-selected floors (dimmed)
  const dimmedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, // Dark grey
        transparent: true,
        opacity: 0.3,
        roughness: 0.8,
        metalness: 0.1,
      }),
    []
  )

  useEffect(() => {
    // Clean up if not in floor mode
    if (mode !== 'floor' || !currentBuilding) {
      if (floorLabels.length > 0) setFloorLabels([])
      return
    }

    const buildingObj = scene.getObjectByName(currentBuilding)
    if (!buildingObj) return

    const getFloorNum = (name: string) => {
      const match = name.match(/(\d+)F/)
      return match ? parseInt(match[1]) : NaN
    }

    const targetLayerNum = getFloorNum(currentLayer)
    const newLabels: {
      name: string
      position: [number, number, number]
      data: any
    }[] = []

    buildingObj.children.forEach((mesh) => {
      if (!(mesh instanceof THREE.Mesh)) return

      const initialPos = mesh.userData.initialPosition
      if (!initialPos) return

      let targetY = initialPos.y
      let shouldShowLabel = false
      const meshFloorNum = getFloorNum(mesh.name)

      // --- Animation & Position Logic ---
      if (currentLayer === '全楼') {
        targetY = initialPos.y
        // Restore material
        if (originalMaterials.has(mesh.uuid)) {
          mesh.material = originalMaterials.get(mesh.uuid)!
        }
      } else {
        let moveUp = false
        // Logic: Move floors above the current one up to separate them
        if (mesh.name.includes('楼顶')) {
          if (!isNaN(targetLayerNum)) moveUp = true
        } else if (!isNaN(meshFloorNum) && !isNaN(targetLayerNum)) {
          if (meshFloorNum > targetLayerNum) moveUp = true
          if (meshFloorNum === targetLayerNum) shouldShowLabel = true
        }

        if (moveUp) targetY = initialPos.y + 25
        // Increased separation distance for better visibility
        else targetY = initialPos.y

        // --- Material Logic ---
        if (meshFloorNum === targetLayerNum) {
          // Highlight selected floor: Restore original material
          if (originalMaterials.has(mesh.uuid)) {
            mesh.material = originalMaterials.get(mesh.uuid)!
          }
        } else {
          // Dim others
          mesh.material = dimmedMaterial
        }
      }

      // Animate position
      gsap.to(mesh.position, {
        y: targetY,
        duration: 0.8,
        ease: 'power3.inOut',
      })

      // Add label if this is the selected floor
      if (shouldShowLabel) {
        // Calculate label position relative to the mesh's new position
        const targetLocalPos = new THREE.Vector3(
          mesh.position.x,
          targetY,
          mesh.position.z
        )
        // Convert to world space for the Html component (if not parented to mesh)
        // But Html inside group follows group? No, Html position is absolute world if not inside mesh.
        // Actually Html component is mounted at [0,0,0] of the scene in the return below,
        // so we need world coordinates or local if put inside the mesh.
        // Here we pass 'position' prop to Html, which expects world coords if not nested?
        // Actually, let's keep using the logic from previous code:
        targetLocalPos.applyMatrix4(buildingObj.matrixWorld)

        newLabels.push({
          name: mesh.name,
          position: [targetLocalPos.x, targetLocalPos.y, targetLocalPos.z],
          data: {
            occupancy: Math.floor(60 + Math.random() * 40) + '%', // Mock data
            temp: (20 + Math.random() * 5).toFixed(1) + '°C',
            status: '正常',
          },
        })
      }
    })

    setFloorLabels(newLabels)

    // --- Camera Focus Logic ---
    if (currentLayer !== '全楼') {
      const layerObj = buildingObj.children.find(
        (child) => child.name === currentLayer
      )
      if (layerObj) {
        const initialPos = layerObj.userData.initialPosition
        if (initialPos && !isNaN(initialPos.x)) {
          const finalWorldPos = initialPos
            .clone()
            .applyMatrix4(buildingObj.matrixWorld)
          if (!isNaN(finalWorldPos.x)) {
            flyTo(
              [
                finalWorldPos.x + 25,
                finalWorldPos.y + 15,
                finalWorldPos.z + 25,
              ],
              [finalWorldPos.x, finalWorldPos.y, finalWorldPos.z],
              1.2
            )
          }
        }
      }
    } else {
      const worldPos = new THREE.Vector3()
      buildingObj.getWorldPosition(worldPos)
      if (!isNaN(worldPos.x)) {
        flyTo(
          [worldPos.x + 40, worldPos.y + 50, worldPos.z + 40],
          [worldPos.x, worldPos.y, worldPos.z]
        )
      }
    }
  }, [
    currentLayer,
    currentBuilding,
    mode,
    scene,
    flyTo,
    originalMaterials,
    dimmedMaterial,
  ])

  if (mode !== 'floor' || !currentBuilding) return null

  return (
    <>
      {floorLabels.map((label, index) => (
        <Html
          key={`floor-${index}`}
          position={label.position}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }} // Wrapper doesn't block, children do
        >
          <div
            className='relative pointer-events-auto cursor-pointer'
            onMouseEnter={() => setHoveredLabel(label.name)}
            onMouseLeave={() => setHoveredLabel(null)}
            onClick={() => setCurrentLayer(label.name)}
          >
            {/* Label Badge */}
            <div
              className={`
                flex items-center justify-center
                px-4 py-1.5 rounded-full text-sm font-bold tracking-wide
                border backdrop-blur-md transition-all duration-300 shadow-lg select-none
                ${
                  hoveredLabel === label.name
                    ? 'bg-blue-600/90 text-white border-blue-400 scale-110 shadow-blue-500/50'
                    : 'bg-slate-900/60 text-blue-100 border-white/20 hover:bg-slate-800/80'
                }
            `}
            >
              <span className='mr-1'>🏢</span> {label.name}
            </div>

            {/* Detailed Tooltip */}
            <div
              className={`
                absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 
                bg-slate-900/95 border border-blue-500/30 rounded-lg p-3 
                shadow-2xl backdrop-blur-xl transition-all duration-300 origin-bottom
                ${
                  hoveredLabel === label.name
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                }
            `}
            >
              <div className='text-xs font-semibold text-slate-400 mb-2 border-b border-white/10 pb-1'>
                楼层详情
              </div>
              <div className='space-y-1.5 text-xs'>
                <div className='flex justify-between items-center'>
                  <span className='text-slate-400'>入住率</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-500'
                        style={{ width: label.data.occupancy }}
                      ></div>
                    </div>
                    <span className='font-mono text-blue-300'>
                      {label.data.occupancy}
                    </span>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>环境温度</span>
                  <span className='font-mono text-yellow-300'>
                    {label.data.temp}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-400'>设施状态</span>
                  <span className='text-green-400 font-medium'>
                    {label.data.status}
                  </span>
                </div>
              </div>

              {/* Decorative Arrow */}
              <div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900/95'></div>
            </div>

            {/* Guide Line */}
            <div
              className={`
                absolute left-1/2 top-full -translate-x-1/2 w-px bg-gradient-to-b from-blue-500/80 to-transparent transition-all duration-300
                ${hoveredLabel === label.name ? 'h-16' : 'h-8 opacity-50'}
            `}
            />
          </div>
        </Html>
      ))}
    </>
  )
}
