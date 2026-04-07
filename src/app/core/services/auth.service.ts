import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // 👈 Importa Router
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router, // 👈 Inyecta Router
  ) {
    // Restaurar sesión si existe
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (token && username) {
      this.currentUserSubject.next({ id: userId, username, token });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('LOGIN RESPONSE:', response);

          const token = response?.data?.token;

          if (!token) {
            console.error('RESPUESTA COMPLETA:', response);
            throw new Error('No se recibió token');
          }

          // Guardar datos en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('userId', String(response.data.id));

          // Actualizar el BehaviorSubject
          this.currentUserSubject.next({
            id: response.data.id,
            username: response.data.username,
            token: token,
          });
        }),
      );
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');

    // Limpiar el BehaviorSubject
    this.currentUserSubject.next(null);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
