import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // 👈 CAMBIA A RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],  // 👈 CAMBIA DashboardComponent por RouterOutlet
  template: `<router-outlet></router-outlet>`  // 👈 CAMBIA a router-outlet
})
export class AppComponent {}