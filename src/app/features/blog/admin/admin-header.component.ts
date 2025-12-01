import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-[#0b1220] border-b border-cyan-400/30 px-6 py-4 shadow-lg shadow-cyan-400/10">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <h1 class="text-2xl font-bold text-cyan-400">ADMIN</h1>

        <!-- Nav Links -->
        <nav class="flex gap-6">
          <a routerLink="/admin/blog" routerLinkActive="text-cyan-300" 
             class="text-gray-300 hover:text-cyan-400 transition">
            Artículos
          </a>
          <a routerLink="/admin/blog/new" routerLinkActive="text-cyan-300" 
             class="text-gray-300 hover:text-cyan-400 transition">
            Nuevo Artículo
          </a>
        </nav>

        <!-- Logout Button -->
        <button 
          (click)="onLogout()"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  `
})
export class AdminHeaderComponent {
  constructor(private auth: AuthService, private router: Router) {}

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/admin/blog/login']);
  }
}
