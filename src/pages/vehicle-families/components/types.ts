export interface VehicleFamily {
    name: string;
    id: string;
  }
  
  export interface SelectOption {
    label: string;
    value: string;
  }
  
  export interface VehicleFormData {
    id?: string;
    family: string;
    model: string;
    transmission: string;
    fuel: string;
    line: string;
    year: string;
    productData: any; // Simplified as per requirements
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface Vehicle extends VehicleFormData {
    id: string;
  }