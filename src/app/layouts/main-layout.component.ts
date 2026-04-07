import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  @Input() title: string = '';
  mobileMenuOpen = false;
  currentUser$: Observable<any>;
  showInstallPrompt = false;
  deferredPrompt: any;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Escuchar evento de instalación de PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
      console.log('✅ PWA instalable disponible');
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }

  installApp(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((result: any) => {
        if (result.outcome === 'accepted') {
          console.log('✅ Usuario instaló la PWA');
        } else {
          console.log('❌ Usuario rechazó la instalación');
        }
        this.showInstallPrompt = false;
        this.deferredPrompt = null;
      });
    }
  }
}