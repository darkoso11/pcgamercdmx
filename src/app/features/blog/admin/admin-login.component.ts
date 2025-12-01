import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#071029] p-6">
      <div class="w-full max-w-md bg-[#0b1220] p-6 rounded-xl border border-white/5">
        <h2 class="text-2xl font-bold text-white mb-4">Admin Login</h2>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-300 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required class="w-full p-2 rounded bg-[#081229] border border-cyan-400/10 text-white" />
          </div>

          <div *ngIf="error" class="text-sm text-red-400">{{ error }}</div>

          <div class="flex gap-2">
            <button type="submit" class="bg-cyan-400 text-[#071029] px-4 py-2 rounded font-bold">Ingresar</button>
            <a routerLink="/" class="ml-auto text-sm text-gray-300">Volver</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  password = '';
  error = '';
  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    try {
      // Try server login first
      await this.auth.login(this.password).toPromise();
      this.router.navigate(['/admin/blog']);
    } catch (e) {
      // Fallback for local dev: accept password 'admin'
      if (this.password === 'admin') {
        // store a mock token
        (this.auth as any).setToken?.('mock-token');
        this.router.navigate(['/admin/blog']);
        return;
      }
      this.error = 'Login failed';
    }
  }
}
