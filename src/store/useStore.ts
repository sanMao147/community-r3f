import { create } from 'zustand'

/**
 * 提示框数据接口
 * 用于显示监测点的详细信息
 */
export interface TooltipData {
  show: boolean // 是否显示提示框
  floor?: string // 楼栋名称
  layer?: string // 楼层名称
  room?: string // 房间名称
  value?: number // 监测数值（水流量或电功率）
  name?: string // 监测点名称
  type?: string // 监测类型（水/电）
  x?: number // 屏幕X坐标
  y?: number // 屏幕Y坐标
  position?: [number, number, number] // 3D空间位置
  video?: string // 视频源（预留）
  cameraName?: string // 摄像头名称（预留）
  id?: string // 唯一标识符
}

/**
 * 应用模式类型
 * - default: 默认视角，显示整体社区
 * - water: 水力监测模式
 * - electric: 电力监测模式
 * - floor: 楼层管理模式
 */
export type AppMode = 'default' | 'water' | 'electric' | 'floor'

/**
 * 全局状态接口定义
 */
interface StoreState {
  // 应用模式相关
  mode: AppMode // 当前应用模式
  setMode: (mode: AppMode) => void // 设置应用模式

  // 提示框相关
  tooltip: TooltipData // 提示框数据
  setTooltip: (data: TooltipData) => void // 设置提示框数据

  // 选中对象相关（用于高亮显示）
  selectedObjects: string[] // 选中对象的UUID数组
  setSelectedObjects: (uuids: string[]) => void // 设置选中对象
  addSelectedObject: (uuid: string) => void // 添加选中对象
  clearSelectedObjects: () => void // 清空选中对象

  // 楼层管理相关
  currentBuilding: string | null // 当前查看的楼栋（如"1号楼"）
  setCurrentBuilding: (name: string | null) => void // 设置当前楼栋
  currentLayer: string // 当前查看的楼层（如"1F"、"2F"、"全楼"）
  setCurrentLayer: (layer: string) => void // 设置当前楼层
  buildingLayers: string[] // 当前楼栋可用的楼层列表
  setBuildingLayers: (layers: string[]) => void // 设置楼层列表
}

/**
 * 全局状态管理Store
 * 使用Zustand进行状态管理
 */
export const useStore = create<StoreState>((set) => ({
  // 初始化应用模式为默认视角
  mode: 'default',
  setMode: (mode) =>
    set({
      mode,
      currentBuilding: null, // 切换模式时重置楼栋选择
      currentLayer: '全楼', // 重置为全楼视图
    }),

  // 初始化提示框为隐藏状态
  tooltip: { show: false },
  setTooltip: (data) => set({ tooltip: data }),

  // 初始化选中对象为空数组
  selectedObjects: [],
  setSelectedObjects: (uuids) => set({ selectedObjects: uuids }),
  addSelectedObject: (uuid) =>
    set((state) => ({ selectedObjects: [...state.selectedObjects, uuid] })),
  clearSelectedObjects: () => set({ selectedObjects: [] }),

  // 初始化楼层管理状态
  currentBuilding: null,
  setCurrentBuilding: (name) => set({ currentBuilding: name }),
  currentLayer: '全楼',
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  buildingLayers: [],
  setBuildingLayers: (layers) => set({ buildingLayers: layers }),
}))
