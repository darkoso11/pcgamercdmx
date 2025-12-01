import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#071029] p-6">
      <div class="w-full max-w-md bg-[#0b1220] p-8 rounded-xl border-2 border-cyan-400/30 shadow-lg shadow-cyan-400/20">
        <!-- Logo/Header -->
        <div class="mb-6 text-center">
          <h1 class="text-3xl font-bold text-cyan-400 mb-2">ADMIN</h1>
          <p class="text-xs text-gray-400 uppercase tracking-widest">Blog Management System</p>
        </div>

        <h2 class="text-xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-cyan-400 mb-2 uppercase">Contraseña</label>
            <input 
              [(ngModel)]="password" 
              name="password" 
              type="password" 
              placeholder="Ingresa tu contraseña"
              required 
              class="w-full p-3 rounded bg-[#081229] border border-cyan-400/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
            />
          </div>

          <div *ngIf="error" class="p-3 bg-red-500/20 border border-red-500 rounded text-sm text-red-300">
            {{ error }}
          </div>

          <div *ngIf="success" class="p-3 bg-green-500/20 border border-green-500 rounded text-sm text-green-300">
            {{ success }}
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full bg-cyan-400 hover:bg-cyan-300 text-[#071029] px-4 py-3 rounded font-bold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-white/10 text-center">
          <p class="text-xs text-gray-400 mb-3">Para desarrollo, usa: <code class="text-cyan-300 bg-black/30 px-2 py-1 rounded">admin</code></p>
          <a routerLink="/" class="text-sm text-gray-400 hover:text-cyan-400 transition">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep input:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #081229 inset;
      -webkit-text-fill-color: white;
    }
  `]
})
export class AdminLoginComponent {
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.password.trim()) {
      this.error = 'Por favor ingresa una contraseña';
      return;
    }

    this.error = '';
    this.success = '';
    this.loading = true;

    try {
      // Intentar login con servidor primero
      const result = await this.auth.login(this.password).toPromise();
      if (result?.token) {
        this.success = 'Autenticación exitosa, redirigiendo...';
        setTimeout(() => this.router.navigate(['/admin/blog']), 500);
      }
    } catch (e) {
      // Fallback para desarrollo local: contraseña 'admin' genera un token mock
      if (this.password === 'admin') {
        this.auth.setToken('mock-token-dev');
        this.success = 'Autenticación exitosa (dev mode), redirigiendo...';
        setTimeout(() => this.router.navigate(['/admin/blog']), 500);
        return;
      }
      this.error = 'Contraseña incorrecta. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
