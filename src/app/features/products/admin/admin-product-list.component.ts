import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#071029] text-white p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-cyan-400 mb-6">Listado de Productos</h1>
        <p class="text-gray-400">Sección en desarrollo...</p>
      </div>
    </div>
  `
})
export class AdminProductListComponent {}
