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
  todasLasCarreras: Carrera[] = []; // Guardar todas las carreras originales
  carrerasFiltradas: Carrera[] = []; // Carreras después del filtro
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

  // Método para filtrar carreras por fecha
  filtrarCarrerasPorFecha(carreras: Carrera[]): Carrera[] {
    const hoyStr = new Date().toISOString().split('T')[0];

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

  // Método para mostrar solo hoy
  mostrarHoy(): void {
    this.mostrarSoloHoy = true;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.aplicarFiltros(); // Aplicar filtro sin recargar
  }

  // Método para mostrar todas
  mostrarTodas(): void {
    this.mostrarSoloHoy = false;
    this.filtroFechaInicio = '';
    this.filtroFechaFin = '';
    this.aplicarFiltros(); // Aplicar filtro sin recargar
  }

  // Aplicar filtros a las carreras
  aplicarFiltros(): void {
    if (!this.todasLasCarreras.length) return;
    
    // Filtrar las carreras según la fecha seleccionada
    this.carrerasFiltradas = this.filtrarCarrerasPorFecha(this.todasLasCarreras);
    
    // Actualizar carreras recientes (primeras 5 de las filtradas)
    this.carrerasRecientes = this.carrerasFiltradas.slice(0, 5);
    
    // Recalcular estadísticas con las carreras filtradas
    this.calcularEstadisticas(this.carrerasFiltradas);
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getCarreras().subscribe({
      next: (response: any) => {
        // Guardar todas las carreras originales
        if (response && response.data) {
          this.todasLasCarreras = response.data;
        } else if (Array.isArray(response)) {
          this.todasLasCarreras = response;
        } else {
          this.todasLasCarreras = [];
        }

        console.log('Todas las carreras:', this.todasLasCarreras);
        
        // Aplicar filtros iniciales (mostrar solo hoy)
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
    // Obtener fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];

    // Obtener año y mes actual
    const añoActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, '0');
    const mesInicioStr = `${añoActual}-${mesActual}-01`;

    // Calcular último día del mes
    const ultimoDiaMes = new Date(añoActual, hoy.getMonth() + 1, 0);
    const mesFinStr = `${añoActual}-${mesActual}-${String(ultimoDiaMes.getDate()).padStart(2, '0')}`;

    // Filtrar carreras de hoy (comparando strings directamente)
    const carrerasHoy = carreras.filter((c) => {
      const fechaRegistro = c.fechaRegistro;
      return fechaRegistro === hoyStr;
    });

    // Filtrar carreras del mes actual
    const carrerasMes = carreras.filter((c) => {
      const fechaRegistro = c.fechaRegistro;
      return fechaRegistro >= mesInicioStr && fechaRegistro <= mesFinStr;
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

    // Estadísticas de HOY (de las carreras filtradas)
    this.estadisticasHoy.total = carrerasHoy.length;
    this.estadisticasHoy.ingresos = carrerasHoy.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );

    // Estadísticas del MES (de las carreras filtradas)
    this.estadisticasMes.total = carrerasMes.length;
    this.estadisticasMes.ingresos = carrerasMes.reduce(
      (sum, c) => sum + (c.precio || 0),
      0,
    );

    console.log('Estadísticas calculadas para carreras filtradas:', {
      totalCarrerasFiltradas: carreras.length,
      estadisticas: this.estadisticas,
      hoy: this.estadisticasHoy,
      mes: this.estadisticasMes,
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