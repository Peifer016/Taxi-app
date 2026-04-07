export interface Carrera {
  id: number;
  cliente: string;
  descripcion: string;
  precio: number;
  estado: string; // 'colocado', 'cancelado', etc.
  fechaRegistro: Date;
  fechaPago?: Date;
}

export interface CreateCarreraDto {
  cliente: string;
  descripcion: string;
  precio: number;
  estado: string;
  fecharegistro: Date;
  fechapago?: Date;
}