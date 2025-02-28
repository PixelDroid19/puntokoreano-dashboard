// src/types/about.types.ts

export interface Consultant {
    id: string;
    name: string;
    position: string;
    image: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    qrCode?: string;
    description?: string;
    order: number;
    active: boolean;
  }
  
  export interface SocialMission {
    text: string;
    backgroundImage: string;
  }
  
  export interface Location {
    address: string;
    mapUrl: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }
  
  export interface AboutSettings {
    consultants: Consultant[];
    socialMission: SocialMission;
    location: Location;
  }
  
  export type ConsultantUpdate = Partial<Omit<Consultant, 'id'>>;
  
  export interface AboutSettingsResponse {
    success: boolean;
    data: AboutSettings;
    message?: string;
  }