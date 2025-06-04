export type ObjectId = string;

export interface VehicleBrand {
  _id: ObjectId;
  name: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleFamily {
  _id: ObjectId;
  name: string;
  brand_id: ObjectId | VehicleBrand;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleModel {
  _id: ObjectId;
  displayName?: string;
  family_id: ObjectId | VehicleFamily;
  year: number[];
  engine_type: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleLine {
  _id: ObjectId;
  name: string;
  model_id: ObjectId | VehicleModel;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleTransmission {
  _id: ObjectId;
  name: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleFuel {
  _id: ObjectId;
  name: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Vehicle {
  _id: ObjectId;
  tag_id?: string;
  model_id: ObjectId | VehicleModel;
  transmission_id: ObjectId | VehicleTransmission;
  fuel_id: ObjectId | VehicleFuel;
  color?: string;
  price?: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleApplicabilityCriteria {
  brands?: ObjectId[];
  families?: ObjectId[];
  models?: ObjectId[];
  lines?: ObjectId[];
  transmissions?: ObjectId[];
  fuels?: ObjectId[];
  minYear?: number;
  maxYear?: number;
  specificYears?: number[];
  engineTypes?: string[];
  colors?: string[];
}

export interface VehicleApplicabilityGroup {
  _id: ObjectId;
  name: string;
  description?: string;
  criteria: VehicleApplicabilityCriteria;
  includedVehicles?: ObjectId[];
  excludedVehicles?: ObjectId[];
  category?: 'repuestos' | 'accesorios' | 'servicio' | 'blog' | 'general';
  tags?: string[];
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 