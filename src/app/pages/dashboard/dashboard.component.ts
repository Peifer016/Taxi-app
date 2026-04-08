import { Component, OnInit } from '@angular/core';
import { Carrera } from '../../core/models/carrera.model';
import { ApiService } from '../../core/services/api.services';
import { MainLayoutComponent } from '../../layouts/main-layout.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  todasLasCarreras: Carrera[] = [];
  carrerasFiltradas: Carrera[] = [];
  carrerasRecientes: Carrera[] = [];
  loading = true;
  Math = Math; // 👈 Agrega esta línea

  // Variables de paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 5;
  totalPaginas: number = 1;

  // Estadísticas
  estadisticas = {
    total: 0,
    ingresos: 0,
    activas: 0,
    clientes: 0,
  };

  estadisticasHoy = {
    total: 0,
    ingresos: 0,
  };

  estadisticasMes = {
    total: 0,
    ingresos: 0,
  };

  // Filtros
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  mostrarSoloHoy: boolean = true;

  // Modal de edición
  showEditModal = false;
  carreraEditando: Carrera | null = null;
  editFormData: any = {
    cliente: '',
    descripcion: '',
    precio: 0,
    estado: '',
    fechaRegistro: '',
    fechaPago: null,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  getFechaLocal(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  filtrarCarrerasPorFecha(carreras: Carrera[]): Carrera[] {
    const hoyStr = this.getFechaLocal();

    return carreras.filter((carrera) => {
      const fechaRegistroStr = carrera.fechaRegistro;

      if (this.mostrarSoloHoy) {
        return fechaRegistroStr === hoyStr;
      }

      if (this.filtroFechaInicio && this.filtroFechaFin) {
        return (
          fechaRegistroStr >= this.filtroFechaInicio &&
          fechaRegistroStr <= this.filtroFechaFin
        );
      }

      if (this.filtroFechaInicio) {
        return fechaRegistroStr >= this.filtroFechaInicio;
      }

      if (this.filtroFechaFin) {
        return fechaRegistroStr <= this.filtroFechaFin;
      }

      return true;
    });
  }

  mostrarHoy(): void {
    this.mostrarSoloHoy = true;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.paginaActual = 1; // Resetear página al cambiar filtro
    this.aplicarFiltros();
  }

  mostrarTodas(): void {
    this.mostrarSoloHoy = false;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.paginaActual = 1; // Resetear página al cambiar filtro
    this.aplicarFiltros();
  }

  // Método para cambiar página
  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPagina();
    }
  }

  // Método para actualizar la página actual
  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    this.carrerasRecientes = this.carrerasFiltradas.slice(inicio, fin);
  }

  // Método para obtener el rango de páginas a mostrar
  get paginas(): number[] {
    const maxPaginasMostradas = 5;
    let inicio = Math.max(
      1,
      this.paginaActual - Math.floor(maxPaginasMostradas / 2),
    );
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasMostradas - 1);

    if (fin - inicio + 1 < maxPaginasMostradas) {
      inicio = Math.max(1, fin - maxPaginasMostradas + 1);
    }

    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  // Aplicar filtros a las carreras
  aplicarFiltros(): void {
    if (!this.todasLasCarreras.length) return;

    this.carrerasFiltradas = this.filtrarCarrerasPorFecha(
      this.todasLasCarreras,
    );

    // Calcular total de páginas
    this.totalPaginas = Math.ceil(
      this.carrerasFiltradas.length / this.registrosPorPagina,
    );

    // Asegurar que la página actual sea válida
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = Math.max(1, this.totalPaginas);
    }

    // Actualizar la página
    this.actualizarPagina();
    this.calcularEstadisticas(this.carrerasFiltradas);

    console.log('Carreras filtradas:', this.carrerasFiltradas.length);
    console.log('Página actual:', this.paginaActual);
    console.log('Total páginas:', this.totalPaginas);
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getCarreras().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.todasLasCarreras = response.data;
        } else if (Array.isArray(response)) {
          this.todasLasCarreras = response;
        } else {
          this.todasLasCarreras = [];
        }

        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading = false;
      },
    });
  }

  calcularEstadisticas(carreras: Carrera[]): void {
    const hoyStr = this.getFechaLocal();

    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const mesInicioStr = `${añoActual}-${mesActual}-01`;

    const ultimoDiaMes = new Date(añoActual, hoy.getMonth() + 1, 0);
    const mesFinStr = `${añoActual}-${mesActual}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;

    const carrerasHoy = carreras.filter((c) => {
      return c.fechaRegistro === hoyStr;
    });

    const carrerasMes = carreras.filter((c) => {
      return c.fechaRegistro >= mesInicioStr && c.fechaRegistro <= mesFinStr;
    });

    const carrerasActivas = carreras.filter(
      (c) => c.estado?.toLowerCase() === 'pendiente',
    );

    this.estadisticas.total = carreras.length;
    this.estadisticas.ingresos = carreras.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );
    this.estadisticas.activas = carrerasActivas.length;
    this.estadisticas.clientes = new Set(carreras.map((c) => c.cliente)).size;

    this.estadisticasHoy.total = carrerasHoy.length;
    this.estadisticasHoy.ingresos = carrerasHoy.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );

    this.estadisticasMes.total = carrerasMes.length;
    this.estadisticasMes.ingresos = carrerasMes.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );
  }

  getEstadoClass(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    const classes: { [key: string]: string } = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-green-100 text-green-800',
    };
    return classes[estadoLower] || 'bg-gray-100 text-gray-800';
  }
}
