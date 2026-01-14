import { create } from 'zustand'

export interface TooltipData {
  show: boolean
  floor?: string
  layer?: string
  room?: string
  value?: number
  name?: string
  type?: string
  x?: number
  y?: number
  position?: [number, number, number]
  video?: string
  cameraName?: string
  id?: string
}

export type AppMode = 'default' | 'water' | 'electric' | 'floor'

interface StoreState {
  mode: AppMode
  setMode: (mode: AppMode) => void

  tooltip: TooltipData
  setTooltip: (data: TooltipData) => void

  selectedObjects: string[] // UUIDs of selected objects for outline
  setSelectedObjects: (uuids: string[]) => void
  addSelectedObject: (uuid: string) => void
  clearSelectedObjects: () => void

  // Floor Management
  currentBuilding: string | null // Current building being inspected (e.g. "1号楼")
  setCurrentBuilding: (name: string | null) => void
  currentLayer: string // Current layer being inspected (e.g. "1F", "2F", "全楼")
  setCurrentLayer: (layer: string) => void
  buildingLayers: string[] // Available layers for current building
  setBuildingLayers: (layers: string[]) => void

  // Monitor Panel
  activeMonitor: TooltipData | null
  setActiveMonitor: (data: TooltipData | null) => void
}

export const useStore = create<StoreState>((set) => ({
  mode: 'default',
  setMode: (mode) =>
    set({
      mode,
      currentBuilding: null,
      currentLayer: '全楼',
      activeMonitor: null,
    }), // Reset floor state on mode change

  tooltip: { show: false },
  setTooltip: (data) => set({ tooltip: data }),

  selectedObjects: [],
  setSelectedObjects: (uuids) => set({ selectedObjects: uuids }),
  addSelectedObject: (uuid) =>
    set((state) => ({ selectedObjects: [...state.selectedObjects, uuid] })),
  clearSelectedObjects: () => set({ selectedObjects: [] }),

  currentBuilding: null,
  setCurrentBuilding: (name) => set({ currentBuilding: name }),
  currentLayer: '全楼',
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  buildingLayers: [],
  setBuildingLayers: (layers) => set({ buildingLayers: layers }),

  activeMonitor: null,
  setActiveMonitor: (data) => set({ activeMonitor: data }),
}))
