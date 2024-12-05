// src/types/auth.types.ts
export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserData;
    token: string;
    expiresAt: number;
  };
}
