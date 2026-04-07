export interface Carrera {
  id: number;
  cliente: string;
  descripcion: string;
  precio: number;
  estado: string;
  fechaRegistro: string;  // ← Cambiar de Date a string
  fechaPago?: string | null;  // ← Cambiar de Date a string
}

export interface CreateCarreraDto {
  cliente: string;
  descripcion: string;
  precio: number;
  estado: string;
  fechaRegistro: string | Date;  // Requerido, no puede ser null
  fechaPago: string | Date | null;  // ✅ Puede ser null si no se selecciona
}
