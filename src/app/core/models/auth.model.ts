export interface Usuario {
  id: number;
  username: string;
  passwordhash: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// 🔥 NUEVO MODELO CORRECTO
export interface LoginResponse {
  data: {
    id: number;
    username: string;
    token: string;
    expiration: string;
    activo: boolean;
  };
  success: boolean;
  message: string;
  errorMessage: string | null;
}