import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Carrera, CreateCarreraDto } from '../models/carrera.model';
import { environment } from '../../environments/environment.prod';

// Interfaz para la respuesta de la API
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string | null;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('✅ ApiService inicializado');
    console.log('📡 API URL:', this.apiUrl);
  }

  // Carreras endpoints
  getCarreras(): Observable<Carrera[]> {
    console.log('🚀 Llamando a getCarreras()');
    const url = `${this.apiUrl}/carreras`;
    console.log('📡 URL:', url);

    return this.http.get<ApiResponse<Carrera[]>>(url).pipe(
      map((response) => {
        console.log('📦 Respuesta recibida:', response);
        return response.data;
      }),
    );
  }

  getCarrera(id: number): Observable<Carrera> {
    return this.http
      .get<ApiResponse<Carrera>>(`${this.apiUrl}/carreras/${id}`)
      .pipe(map((response) => response.data));
  }

  createCarrera(carrera: CreateCarreraDto): Observable<Carrera> {
    return this.http
      .post<ApiResponse<Carrera>>(`${this.apiUrl}/carreras`, carrera)
      .pipe(map((response) => response.data));
  }

  updateCarrera(id: number, carrera: CreateCarreraDto): Observable<Carrera> {
    return this.http
      .put<ApiResponse<Carrera>>(`${this.apiUrl}/carreras/${id}`, carrera)
      .pipe(map((response) => response.data));
  }

  deleteCarrera(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/carreras/${id}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.errorMessage || 'Error al eliminar');
          }
        }),
      );
  }

  getEstadisticas(): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiUrl}/carreras/estadisticas`)
      .pipe(map((response) => response.data));
  }
}
