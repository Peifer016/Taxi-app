import { Component, OnInit } from '@angular/core';
import { Carrera, CreateCarreraDto } from '../../core/models/carrera.model';
import { ApiService } from '../../core/services/api.services';
import { MainLayoutComponent } from '../../layouts/main-layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: './carreras.component.html',
})
export class CarrerasComponent implements OnInit {
  carreras: Carrera[] = [];
  carrerasOriginal: Carrera[] = []; // Guardar todas las carreras sin filtrar
  loading = false;
  showModal = false;
  editingCarrera: Carrera | null = null;
  filtro = '';
  estadoFiltro = '';
  showDeleteModal = false;
  carreraToDelete: Carrera | null = null;
  filtroVisible: boolean = false;

  // Nuevos filtros de fecha
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  mostrarSoloHoy: boolean = true; // Por defecto mostrar solo hoy

  formData: CreateCarreraDto = {
    cliente: '',
    descripcion: '',
    precio: 0,
    estado: 'colocado',
    fechaRegistro: new Date(),
    fechaPago: null,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    this.loading = true;
    this.apiService.getCarreras().subscribe({
      next: (data) => {
        this.carrerasOriginal = data;
        // Aplicar filtro de hoy automáticamente
        this.mostrarSoloHoy = true;
        this.filtroFechaInicio = '';
        this.filtroFechaFin = '';
        this.aplicarFiltros(); // Esto mostrará solo las de hoy
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading carreras:', err);
        this.loading = false;
      },
    });
  }

  // Método para aplicar todos los filtros
  aplicarFiltros(): void {
    let filtered = [...this.carrerasOriginal];

    // Filtro por texto (cliente o descripción)
    if (this.filtro) {
      filtered = filtered.filter(
        (c) =>
          c.cliente.toLowerCase().includes(this.filtro.toLowerCase()) ||
          c.descripcion.toLowerCase().includes(this.filtro.toLowerCase()),
      );
    }

    // Filtro por estado (comparar sin importar mayúsculas)
    if (this.estadoFiltro) {
      filtered = filtered.filter(
        (c) => c.estado.toLowerCase() === this.estadoFiltro.toLowerCase(),
      );
    }

    // Filtro por fecha
    filtered = this.filtrarPorFecha(filtered);

    this.carreras = filtered;
  }

  filtrarPorFecha(carreras: Carrera[]): Carrera[] {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${año}-${mes}-${dia}`; // '2026-04-07'

    return carreras.filter((carrera) => {
      // La fecha ya viene como string "2026-04-07" del backend
      const fechaRegistroStr = carrera.fechaRegistro;

      // Si está activado "Mostrar solo hoy"
      if (this.mostrarSoloHoy) {
        return fechaRegistroStr === hoyStr;
      }

      // Si hay filtro de fecha inicio y fecha fin
      if (this.filtroFechaInicio && this.filtroFechaFin) {
        return (
          fechaRegistroStr >= this.filtroFechaInicio &&
          fechaRegistroStr <= this.filtroFechaFin
        );
      }

      // Solo fecha inicio
      if (this.filtroFechaInicio) {
        return fechaRegistroStr >= this.filtroFechaInicio;
      }

      // Solo fecha fin
      if (this.filtroFechaFin) {
        return fechaRegistroStr <= this.filtroFechaFin;
      }

      return true;
    });
  }

  // Método para limpiar filtros de fecha
  limpiarFiltrosFecha(): void {
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.mostrarSoloHoy = false;
    this.aplicarFiltros();
  }

  // Método para mostrar todas las carreras
  mostrarTodas(): void {
    this.mostrarSoloHoy = false;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.filtro = '';
    this.estadoFiltro = '';
    this.aplicarFiltros();
  }

  // Método para mostrar solo hoy
  mostrarHoy(): void {
    this.mostrarSoloHoy = true;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.aplicarFiltros();
  }

  // Getters para usar en el template
  get carrerasFiltradas(): Carrera[] {
    return this.carreras;
  }

  openModal(carrera?: Carrera): void {
    if (carrera) {
      this.editingCarrera = carrera;
      this.formData = {
        cliente: carrera.cliente,
        descripcion: carrera.descripcion,
        precio: carrera.precio,
        estado: carrera.estado.toLowerCase(), // Normalizar a minúsculas
        fechaRegistro: new Date().toLocaleDateString('en-CA'), // 'en-CA' da formato YYYY-MM-DD
        fechaPago: carrera.fechaPago || null,
      };
    } else {
      this.editingCarrera = null;
      this.formData = {
        cliente: '',
        descripcion: '',
        precio: 0,
        estado: 'pendiente', // Minúscula
        fechaRegistro: new Date().toLocaleDateString('en-CA'), // 'en-CA' da formato YYYY-MM-DD
        fechaPago: null,
      };
    }
    this.showModal = true;
  }
  closeModal(): void {
    this.showModal = false;
    this.editingCarrera = null;
  }

  saveCarrera(): void {
    const carreraData: CreateCarreraDto = {
      cliente: this.formData.cliente,
      descripcion: this.formData.descripcion,
      precio: this.formData.precio,
      estado: this.formData.estado.toLowerCase(),
      fechaRegistro: this.formData.fechaRegistro, // Ya viene en formato correcto
      fechaPago: this.formData.fechaPago || null,
    };

    if (this.editingCarrera) {
      this.apiService
        .updateCarrera(this.editingCarrera.id, carreraData)
        .subscribe({
          next: () => {
            this.loadCarreras();
            this.closeModal();
          },
          error: (err) => console.error('Error updating:', err),
        });
    } else {
      this.apiService.createCarrera(carreraData).subscribe({
        next: () => {
          this.loadCarreras();
          this.closeModal();
        },
        error: (err) => console.error('Error creating:', err),
      });
    }
  }

  // Después - con el modal
  deleteCarrera(carrera: Carrera): void {
    this.carreraToDelete = carrera;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.carreraToDelete) {
      this.apiService.deleteCarrera(this.carreraToDelete.id).subscribe({
        next: () => {
          this.loadCarreras();
          this.closeDeleteModal();
        },
        error: (err) => console.error('Error deleting:', err),
      });
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.carreraToDelete = null;
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      cancelado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
    };
    return classes[estado.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  getEstadoIcon(estado: string): string {
    const icons: { [key: string]: string } = {
      cancelado: '✅',
      pendiente: '⏳',
    };
    return icons[estado.toLowerCase()] || '🚕';
  }

  getFechaLocal(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  // Agrega este método en tu componente
  onEstadoChange(estado: string): void {
    if (estado.toLowerCase() === 'cancelado') {
      this.formData.fechaPago = this.getFechaLocal();
    } else if (
      estado.toLowerCase() !== 'cancelado' &&
      this.formData.fechaPago !== null
    ) {
    }
  }
}
