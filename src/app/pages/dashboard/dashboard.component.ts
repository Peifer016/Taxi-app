import { Component, OnInit } from '@angular/core';
import { Carrera } from '../../core/models/carrera.model';
import { ApiService } from '../../core/services/api.services';
import { MainLayoutComponent } from '../../layouts/main-layout.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  todasLasCarreras: Carrera[] = [];
  carrerasFiltradas: Carrera[] = [];
  carrerasRecientes: Carrera[] = [];
  loading = true;

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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  // 🔧 Función para obtener fecha local en formato YYYY-MM-DD
  getFechaLocal(): string {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  // Método para filtrar carreras por fecha (usando fecha local)
  filtrarCarrerasPorFecha(carreras: Carrera[]): Carrera[] {
    const hoyStr = this.getFechaLocal(); // 👈 Usar fecha local

    console.log('Fecha local hoy:', hoyStr);
    console.log('Carreras a filtrar:', carreras.map(c => ({ id: c.id, fecha: c.fechaRegistro })));

    return carreras.filter((carrera) => {
      const fechaRegistroStr = carrera.fechaRegistro;

      if (this.mostrarSoloHoy) {
        const coincide = fechaRegistroStr === hoyStr;
        if (coincide) {
          console.log(`Carrera ${carrera.id} coincide: ${fechaRegistroStr} === ${hoyStr}`);
        }
        return coincide;
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

  // Método para mostrar solo hoy
  mostrarHoy(): void {
    this.mostrarSoloHoy = true;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.aplicarFiltros();
  }

  // Método para mostrar todas
  mostrarTodas(): void {
    this.mostrarSoloHoy = false;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.aplicarFiltros();
  }

  // Aplicar filtros a las carreras
  aplicarFiltros(): void {
    if (!this.todasLasCarreras.length) return;
    
    this.carrerasFiltradas = this.filtrarCarrerasPorFecha(this.todasLasCarreras);
    this.carrerasRecientes = this.carrerasFiltradas.slice(0, 5);
    this.calcularEstadisticas(this.carrerasFiltradas);
    
    console.log('Carreras filtradas:', this.carrerasFiltradas.length);
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
    const hoyStr = this.getFechaLocal(); // 👈 Usar fecha local

    // Obtener año y mes actual (local)
    const hoy = new Date();
    const añoActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const mesInicioStr = `${añoActual}-${mesActual}-01`;

    // Calcular último día del mes
    const ultimoDiaMes = new Date(añoActual, hoy.getMonth() + 1, 0);
    const mesFinStr = `${añoActual}-${mesActual}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;

    // Filtrar carreras de hoy
    const carrerasHoy = carreras.filter((c) => {
      return c.fechaRegistro === hoyStr;
    });

    // Filtrar carreras del mes actual
    const carrerasMes = carreras.filter((c) => {
      return c.fechaRegistro >= mesInicioStr && c.fechaRegistro <= mesFinStr;
    });

    // Carreras activas (pendientes)
    const carrerasActivas = carreras.filter(
      (c) => c.estado?.toLowerCase() === 'pendiente'
    );

    // Estadísticas de las carreras FILTRADAS
    this.estadisticas.total = carreras.length;
    this.estadisticas.ingresos = carreras.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );
    this.estadisticas.activas = carrerasActivas.length;
    this.estadisticas.clientes = new Set(carreras.map((c) => c.cliente)).size;

    // Estadísticas de HOY
    this.estadisticasHoy.total = carrerasHoy.length;
    this.estadisticasHoy.ingresos = carrerasHoy.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );

    // Estadísticas del MES
    this.estadisticasMes.total = carrerasMes.length;
    this.estadisticasMes.ingresos = carrerasMes.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );

    console.log('Estadísticas:', {
      fechaLocal: hoyStr,
      carrerasHoy: carrerasHoy.length,
      carrerasMes: carrerasMes.length,
      totalFiltradas: carreras.length
    });
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