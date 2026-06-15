import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

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
          <p class="text-xs text-gray-400 uppercase tracking-widest">Content Management System</p>
        </div>

        <h2 class="text-xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>

        <form (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-cyan-400 mb-2 uppercase">Correo</label>
            <input
              [(ngModel)]="email"
              name="email"
              type="email"
              placeholder="admin@pcgamercdmx.com"
              required
              autocomplete="username"
              class="w-full p-3 rounded bg-[#081229] border border-cyan-400/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/20 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-cyan-400 mb-2 uppercase">Contraseña</label>
            <input 
              [(ngModel)]="password" 
              name="password" 
              type="password" 
              placeholder="Ingresa tu contraseña"
              required 
              autocomplete="current-password"
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
  email = 'admin@pcgamercdmx.com';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Por favor ingresa correo y contraseña';
      return;
    }

    this.error = '';
    this.success = '';
    this.loading = true;

    try {
      const result = await this.auth.login(this.email.trim(), this.password).toPromise();
      if (result?.token) {
        this.success = 'Autenticación exitosa, redirigiendo...';
        setTimeout(() => this.router.navigate(['/admin']), 500);
      }
    } catch (e) {
      this.error = 'Correo o contraseña inválidos';
      this.loading = false;
    }
  }
}
