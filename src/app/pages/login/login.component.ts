import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {

  if (!this.username || !this.password) {
    this.errorMessage = 'Por favor complete todos los campos';
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  this.authService.login({
    username: this.username,
    password: this.password
  }).subscribe({
    next: (res) => {

      console.log("LOGIN OK:", res);

      // 🔍 Verificar token
      const token = localStorage.getItem('token');
      console.log("TOKEN:", token);

      if (!token) {
        this.errorMessage = 'Error al guardar token';
        this.loading = false;
        return;
      }

      // 🚀 REDIRECCIÓN FORZADA
      this.router.navigateByUrl('/dashboard');
    },
    error: (err) => {
      console.error('Login error:', err);
      this.errorMessage = 'Usuario o contraseña incorrectos';
      this.loading = false;
    }
  });
}
}