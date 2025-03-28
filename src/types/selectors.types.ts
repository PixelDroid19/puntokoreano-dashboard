export interface BrandOption {
  value: string;
  label: string;
  country?: string;
}

export interface LinesOption {
  value: string;
  label: string;
}

export interface FamilieOption {
  value: string;
  label: string;
}

export interface ModelsOption {
  value: string;
  label: string;
}

export interface TransmissionsOption {
  value: string;
  label: string;
}

export interface FuelsOption {
  value: string;
  label: string;
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
