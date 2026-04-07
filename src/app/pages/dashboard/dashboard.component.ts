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
  // Estadísticas totales
  estadisticas = {
    total: 0,
    ingresos: 0,
    activas: 0,
    clientes: 0
  };
  
  // 👈 NUEVAS ESTADÍSTICAS POR DÍA Y MES
  estadisticasHoy = {
    total: 0,
    ingresos: 0
  };
  
  estadisticasMes = {
    total: 0,
    ingresos: 0
  };
  
  carrerasRecientes: Carrera[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.apiService.getCarreras().subscribe({
      next: (carreras) => {
        console.log('Carreras:', carreras);
        this.carrerasRecientes = carreras.slice(0, 5);
        this.calcularEstadisticas(carreras);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading = false;
      },
    });
  }

  calcularEstadisticas(carreras: Carrera[]): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    // Filtrar carreras de hoy
    const carrerasHoy = carreras.filter(c => {
      const fecha = new Date(c.fechaRegistro);
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    });
    
    // Filtrar carreras del mes actual
    const carrerasMes = carreras.filter(c => {
      const fecha = new Date(c.fechaRegistro);
      return fecha >= inicioMes && fecha <= finMes;
    });
    
    // Estadísticas TOTALES
    this.estadisticas.total = carreras.length;
    this.estadisticas.ingresos = carreras.reduce((sum, c) => sum + (c.precio || 0), 0);
    this.estadisticas.activas = carreras.filter(c => 
      c.estado?.toLowerCase() === 'colocado' || 
      c.estado?.toLowerCase() === 'pendiente'
    ).length;
    this.estadisticas.clientes = new Set(carreras.map(c => c.cliente)).size;
    
    // Estadísticas de HOY
    this.estadisticasHoy.total = carrerasHoy.length;
    this.estadisticasHoy.ingresos = carrerasHoy.reduce((sum, c) => sum + (c.precio || 0), 0);
    
    // Estadísticas del MES
    this.estadisticasMes.total = carrerasMes.length;
    this.estadisticasMes.ingresos = carrerasMes.reduce((sum, c) => sum + (c.precio || 0), 0);
    
    console.log('Estadísticas calculadas:', {
      total: this.estadisticas,
      hoy: this.estadisticasHoy,
      mes: this.estadisticasMes
    });
  }

  getEstadoClass(estado: string): string {
    const classes: { [key: string]: string } = {
      cancelado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
    };
    return classes[estado?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}