import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-[#0b1220] border-b border-cyan-400/30 px-6 py-4 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-cyan-400">ADMIN — Blog</h1>
          <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Gestión de contenido</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/admin" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-semibold transition">
            ← Volver a Admin
          </a>
          <a routerLink="/" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-semibold transition">
            Ir a Inicio
          </a>
        </div>
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
