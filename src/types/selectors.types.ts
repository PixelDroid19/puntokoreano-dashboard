export interface BrandOption {
  value: string;
  label: string;
  country?: string;
}

export interface LinesOption {
  value: string;
  label: string;
}

interface ApiFamily {
  _id: string;
  name: string;
  brand_id?: string;
  [key: string]: any;
}
export interface FamilieOption {
  value: string;
  label: string;
  brand_id?: string;
}

export interface ModelsOption {
  value: string;
  label: string;
}

interface ApiTransmission {
  _id: string;
  name: string;
  gears?: number;
  [key: string]: any;
}

interface ApiFuel {
  _id: string;
  name: string;
  octane_rating?: number;
  [key: string]: any;
}

export interface TransmissionsOption {
  value: string;
  label: string;
  gears?: number;
  transmissionData: ApiTransmission;
}

export interface FuelsOption {
  value: string;
  label: string;
  octane_rating?: number;
  fuelData: ApiFuel;
}

export interface VehiclesOption {
  value: string;
  label: string;
}

export interface VehicleSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface TransmissionSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface FuelSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface LinesSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface ModelSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}

export interface BrandSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}
export interface FamilieSelectorProps {
  onChange?: (value: string | null) => void;
  value?: string;
  placeholder?: string;
  [key: string]: any;
}
