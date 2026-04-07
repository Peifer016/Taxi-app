import { Component, OnInit } from '@angular/core';
import { Carrera } from '../../core/models/carrera.model';
import { ApiService } from '../../core/services/api.services';
import { MainLayoutComponent } from '../../layouts/main-layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [
    CommonModule, // 👈 pipes (date, currency, uppercase, slice)
    FormsModule, // 👈 ngModel
    MainLayoutComponent, // 👈 tu layout
  ],
  templateUrl: './carreras.component.html',
})
export class CarrerasComponent implements OnInit {
  carreras: Carrera[] = [];
  loading = false;
  showModal = false;
  editingCarrera: Carrera | null = null;
  filtro = '';
  estadoFiltro = '';

  formData: any = {
    cliente: '',
    descripcion: '',
    precio: 0,
    estado: 'colocado',
    fecharegistro: new Date(),
    fechapago: null,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    this.loading = true;
    this.apiService.getCarreras().subscribe({
      next: (data) => {
        this.carreras = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading carreras:', err);
        this.loading = false;
      },
    });
  }

  get carrerasFiltradas(): Carrera[] {
    let filtered = this.carreras;

    if (this.filtro) {
      filtered = filtered.filter(
        (c) =>
          c.cliente.toLowerCase().includes(this.filtro.toLowerCase()) ||
          c.descripcion.toLowerCase().includes(this.filtro.toLowerCase()),
      );
    }

    if (this.estadoFiltro) {
      filtered = filtered.filter((c) => c.estado === this.estadoFiltro);
    }

    return filtered;
  }

  openModal(carrera?: Carrera): void {
    if (carrera) {
      this.editingCarrera = carrera;
      this.formData = {
        cliente: carrera.cliente,
        descripcion: carrera.descripcion,
        precio: carrera.precio,
        estado: carrera.estado,
        fecharegistro: carrera.fechaRegistro,
        fechapago: carrera.fechaPago || null,
      };
    } else {
      this.editingCarrera = null;
      this.formData = {
        cliente: '',
        descripcion: '',
        precio: 0,
        estado: 'colocado',
        fecharegistro: new Date(),
        fechapago: null,
      };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCarrera = null;
  }

  saveCarrera(): void {
    // Convertir las fechas al formato que espera el backend (YYYY-MM-DD)
    const carreraData = {
      ...this.formData,
      fechaRegistro: this.formData.fechaRegistro
        ? new Date(this.formData.fechaRegistro).toISOString().split('T')[0]
        : null,
      fechaPago: this.formData.fechaPago
        ? new Date(this.formData.fechaPago).toISOString().split('T')[0]
        : null,
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

  deleteCarrera(id: number): void {
    if (confirm('¿Está seguro de eliminar esta carrera?')) {
      this.apiService.deleteCarrera(id).subscribe({
        next: () => this.loadCarreras(),
        error: (err) => console.error('Error deleting:', err),
      });
    }
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
}
