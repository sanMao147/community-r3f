import { Html } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useCameraAnimation } from '../../hooks/useCameraAnimation'
import { useSceneSetup } from '../../hooks/useSceneSetup'
import { useStore } from '../../store/useStore'
import { Tooltip } from '../ui/Tooltip'
import { Atmosphere } from './Atmosphere'
import { BuildingLabels } from './BuildingLabels'
import { FloorManager } from './FloorManager'

interface CommunityModelProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

export const CommunityModel = ({ controlsRef }: CommunityModelProps) => {
  const { scene, transparentMaterial, originalMaterials, restoreMaterials } =
    useSceneSetup()
  const {
    mode,
    setTooltip,
    clearSelectedObjects,
    addSelectedObject,
    setCurrentBuilding,
    setBuildingLayers,
    currentBuilding,
    setActiveMonitor,
    setCurrentLayer,
  } = useStore()
  const { flyTo } = useCameraAnimation(controlsRef)

  // State for monitor labels
  const [monitorLabels, setMonitorLabels] = useState<
    {
      position: [number, number, number]
      name: string
      type: 'water' | 'electric'
    }[]
  >([])

  // Glowing materials for specific modes
  const waterMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 2,
        roughness: 0.2,
        metalness: 0.5,
        toneMapped: false,
      }),
    []
  )

  const electricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 2,
        roughness: 0.2,
        metalness: 0.5,
        toneMapped: false,
      }),
    []
  )

  // Handle Mode Switching
  useEffect(() => {
    clearSelectedObjects()
    setTooltip({ show: false })
    setActiveMonitor(null)
    setMonitorLabels([])

    if (mode === 'water') {
      flyTo([5.14, 6.98, 1.84], [11.71, -0.78, 12.35])
      const labels: {
        position: [number, number, number]
        name: string
        type: 'water' | 'electric'
      }[] = []

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (!obj.name.includes('水管')) {
            obj.material = transparentMaterial
          } else {
            // Apply glowing material
            obj.material = waterMaterial
            // Add label
            // Get center of the object instead of position (which might be bottom-left)
            obj.geometry.computeBoundingBox()
            const center = new THREE.Vector3()
            obj.geometry.boundingBox?.getCenter(center)
            obj.localToWorld(center)

            labels.push({
              position: [center.x, center.y + 0.5, center.z],
              name: obj.name,
              type: 'water',
            })
          }
        }
      })
      setMonitorLabels(labels)
    } else if (mode === 'electric') {
      flyTo([17.05, 5.51, 19.18], [5.68, 1.39, 4.69])
      const labels: {
        position: [number, number, number]
        name: string
        type: 'water' | 'electric'
      }[] = []

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (!obj.name.includes('电表')) {
            obj.material = transparentMaterial
          } else {
            // Apply glowing material
            obj.material = electricMaterial
            // Add label
            obj.geometry.computeBoundingBox()
            const center = new THREE.Vector3()
            obj.geometry.boundingBox?.getCenter(center)
            obj.localToWorld(center)

            labels.push({
              position: [center.x, center.y + 0.5, center.z],
              name: obj.name,
              type: 'electric',
            })
          }
        }
      })
      setMonitorLabels(labels)
    } else if (mode === 'floor') {
      flyTo([18.31, 41.48, 32.01], [17.38, -3.54, 1.71])
      restoreMaterials()
    } else {
      restoreMaterials()
      flyTo([68, 27, 47], [-9.94, 1.36, 3.18])
      setCurrentBuilding(null)

      scene.traverse((obj) => {
        if (obj.userData.initialPosition) {
          gsap.to(obj.position, {
            x: obj.userData.initialPosition.x,
            y: obj.userData.initialPosition.y,
            z: obj.userData.initialPosition.z,
            duration: 0.5,
          })
        }
      })
    }
  }, [
    mode,
    scene,
    transparentMaterial,
    originalMaterials,
    flyTo,
    clearSelectedObjects,
    setTooltip,
    restoreMaterials,
    setCurrentBuilding,
    waterMaterial,
    electricMaterial,
    setActiveMonitor,
  ])

  // Handle Building Selection
  const handleBuildingSelect = (
    buildingName: string,
    position: [number, number, number]
  ) => {
    setCurrentBuilding(buildingName)

    flyTo(
      [position[0] + 10, position[1] + 20, position[2] + 10],
      [position[0], position[1], position[2]]
    )

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        let isTarget = false
        let curr: THREE.Object3D | null = obj
        while (curr) {
          if (curr.name === buildingName) {
            isTarget = true
            break
          }
          curr = curr.parent
        }

        if (isTarget) {
          if (originalMaterials.has(obj.uuid)) {
            obj.material = originalMaterials.get(obj.uuid)!
          }
        } else {
          obj.material = transparentMaterial
        }
      }
    })

    const buildingObj = scene.getObjectByName(buildingName)
    if (buildingObj) {
      const layers = buildingObj.children
        .filter((child) => child.name.includes('F'))
        .map((child) => child.name)
        .sort((a, b) => {
          const matchA = a.match(/(\d+)F/)
          const matchB = b.match(/(\d+)F/)
          const numA = matchA ? parseInt(matchA[1]) : 0
          const numB = matchB ? parseInt(matchB[1]) : 0
          return numA - numB
        })
      setBuildingLayers(['全楼', ...layers])
    }
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const obj = e.object as THREE.Mesh

    // Monitor Mode Interaction
    if (mode === 'water' && obj.name.includes('水管')) {
      handleMonitorClick(e, obj, '水', 20)
      return
    } else if (mode === 'electric' && obj.name.includes('电表')) {
      handleMonitorClick(e, obj, '电', 480)
      return
    }

    // Floor Mode Interaction
    if (mode === 'floor' && currentBuilding) {
      // Check if clicked object belongs to current building
      let isChild = false
      let curr: THREE.Object3D | null = obj
      while (curr) {
        if (curr.name === currentBuilding) {
          isChild = true
          break
        }
        curr = curr.parent
      }

      if (isChild) {
        // Find which floor it is
        // The structure is Building -> Floor -> Mesh
        // Or Building -> Mesh (if mesh name has F)
        let floorName = ''
        if (obj.name.includes('F')) floorName = obj.name
        else if (obj.parent?.name.includes('F')) floorName = obj.parent.name

        if (floorName) {
          setCurrentLayer(floorName)
        }
      }
    }
  }

  const handleMonitorClick = (
    e: ThreeEvent<MouseEvent>,
    obj: THREE.Mesh,
    type: string,
    value: number
  ) => {
    clearSelectedObjects()
    addSelectedObject(obj.uuid)

    const floorName = obj.parent?.parent?.name || ''
    const layerName = obj.parent?.name.substring(0, 2) || ''
    const roomName = obj.name.substring(0, 3) || ''

    // Set Tooltip (still useful for quick info)
    setTooltip({
      show: true,
      floor: floorName,
      layer: layerName,
      room: roomName,
      value: value,
      name: obj.name,
      type: type,
      x: e.clientX,
      y: e.clientY,
      position: [e.point.x, e.point.y, e.point.z],
    })

    // Open Monitor Panel
    setActiveMonitor({
      show: true,
      floor: floorName,
      layer: layerName,
      room: roomName,
      value: value,
      name: obj.name,
      type: type,
      id: obj.uuid,
    })
  }

  const handlePointerMissed = () => {
    if (mode !== 'floor') {
      setTooltip({ show: false })
      clearSelectedObjects()
      setActiveMonitor(null)
    }
  }

  return (
    <group>
      {/* Atmosphere Effects */}
      <Atmosphere />

      <primitive
        object={scene}
        onClick={handleClick}
        onPointerMissed={handlePointerMissed}
      />

      <BuildingLabels
        scene={scene}
        onSelect={handleBuildingSelect}
      />
      <FloorManager
        scene={scene}
        flyTo={flyTo}
        originalMaterials={originalMaterials}
      />
      <Tooltip />

      {/* Monitor Labels */}
      {monitorLabels.map((label, i) => (
        <Html
          key={i}
          position={label.position}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`
                  px-2 py-1 rounded text-xs font-bold border backdrop-blur-sm shadow-sm opacity-80
                  ${
                    label.type === 'electric'
                      ? 'bg-yellow-900/40 text-yellow-200 border-yellow-500/30'
                      : 'bg-blue-900/40 text-blue-200 border-blue-500/30'
                  }
              `}
          >
            {label.name}
          </div>
        </Html>
      ))}
    </group>
  )
}
