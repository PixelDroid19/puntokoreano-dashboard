import { create } from "zustand"

export type SelectOption = {
  value: string
  label: string
}

export type Activity = {
  type: "vehicle" | "brand" | "family" | "model" | "line" | "transmission" | "fuel"
  title: string
  description: string
  timestamp: Date
}

interface VehicleStore {
  brands: any[]
  families: any[]
  models: any[]
  lines: any[]
  transmissions: any[]
  fuels: any[]
  activities: Activity[]
  selectedBrand: SelectOption | null
  selectedFamily: SelectOption | null
  selectedModel: SelectOption | null
  selectedLine: SelectOption | null
  selectedTransmission: SelectOption | null
  selectedFuel: SelectOption | null
  setBrands: (brands: any[]) => void
  setFamilies: (families: any[]) => void
  setModels: (models: any[]) => void
  setLines: (lines: any[]) => void
  setTransmissions: (transmissions: any[]) => void
  setFuels: (fuels: any[]) => void
  setSelectedBrand: (brand: SelectOption | null) => void
  setSelectedFamily: (family: SelectOption | null) => void
  setSelectedModel: (model: SelectOption | null) => void
  setSelectedLine: (line: SelectOption | null) => void
  setSelectedTransmission: (transmission: SelectOption | null) => void
  setSelectedFuel: (fuel: SelectOption | null) => void
  addActivity: (activity: Activity) => void
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  brands: [],
  families: [],
  models: [],
  lines: [],
  transmissions: [],
  fuels: [],
  activities: [
    {
      type: "vehicle",
      title: "Nuevo vehículo creado",
      description: "Toyota Corolla 2023",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    },
    {
      type: "brand",
      title: "Marca actualizada",
      description: "Honda Motors",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    },
    {
      type: "model",
      title: "Nuevo modelo añadido",
      description: "Civic Type R",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
    },
    {
      type: "transmission",
      title: "Transmisión creada",
      description: "CVT 8 velocidades",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
    },
    {
      type: "fuel",
      title: "Combustible añadido",
      description: "Gasolina Premium 95",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
    },
  ],
  selectedBrand: null,
  selectedFamily: null,
  selectedModel: null,
  selectedLine: null,
  selectedTransmission: null,
  selectedFuel: null,
  setBrands: (brands) => set({ brands }),
  setFamilies: (families) => set({ families }),
  setModels: (models) => set({ models }),
  setLines: (lines) => set({ lines }),
  setTransmissions: (transmissions) => set({ transmissions }),
  setFuels: (fuels) => set({ fuels }),
  setSelectedBrand: (brand) =>
    set({
      selectedBrand: brand,
      selectedFamily: null,
      selectedModel: null,
      selectedLine: null,
    }),
  setSelectedFamily: (family) =>
    set({
      selectedFamily: family,
      selectedModel: null,
      selectedLine: null,
    }),
  setSelectedModel: (model) =>
    set({
      selectedModel: model,
      selectedLine: null,
    }),
  setSelectedLine: (line) => set({ selectedLine: line }),
  setSelectedTransmission: (transmission) => set({ selectedTransmission: transmission }),
  setSelectedFuel: (fuel) => set({ selectedFuel: fuel }),
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities],
    })),
}))

