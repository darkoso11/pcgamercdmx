import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../services/blog.service';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminHeaderComponent],
  template: `
  <app-admin-header></app-admin-header>
  <div class="min-h-screen bg-[#071029] text-white p-6">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Gestor de Categorías</h2>

      <div class="mb-6 p-4 bg-[#081229] rounded border border-white/5">
        <h3 class="font-semibold mb-2">Nueva Categoría</h3>
        <div class="flex gap-2">
          <input [(ngModel)]="newName" placeholder="Nombre" class="p-2 bg-[#0b1220] border border-white/10 rounded w-1/3" />
          <input [(ngModel)]="newDescription" placeholder="Descripción" class="p-2 bg-[#0b1220] border border-white/10 rounded flex-1" />
          <button (click)="create()" class="px-4 py-2 bg-cyan-400 text-[#071029] rounded font-bold">Crear</button>
        </div>
      </div>

      <div class="p-4 bg-[#081229] rounded border border-white/5">
        <h3 class="font-semibold mb-4">Categorías existentes</h3>
        <table class="w-full table-auto">
          <thead>
            <tr class="text-left text-sm text-gray-300">
              <th class="pb-2">Nombre</th>
              <th class="pb-2">Descripción</th>
              <th class="pb-2 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categories" class="align-top border-t border-white/5">
              <td class="py-3">
                <ng-container *ngIf="editId !== c._id; else editName">
                  {{ c.name }}
                </ng-container>
                <ng-template #editName>
                  <input [(ngModel)]="editNameVal" class="p-1 bg-[#071229] border border-white/10 rounded w-full" />
                </ng-template>
              </td>
              <td class="py-3">
                <ng-container *ngIf="editId !== c._id; else editDesc">
                  {{ c.description }}
                </ng-container>
                <ng-template #editDesc>
                  <input [(ngModel)]="editDescVal" class="p-1 bg-[#071229] border border-white/10 rounded w-full" />
                </ng-template>
              </td>
              <td class="py-3">
                <ng-container *ngIf="editId !== c._id">
                  <button (click)="startEdit(c)" class="px-3 py-1 mr-2 bg-yellow-400 text-[#071029] rounded">Editar</button>
                  <button (click)="remove(c._id)" class="px-3 py-1 bg-red-500 rounded">Borrar</button>
                </ng-container>
                <ng-container *ngIf="editId === c._id">
                  <button (click)="saveEdit(c._id)" class="px-3 py-1 mr-2 bg-green-500 rounded">Guardar</button>
                  <button (click)="cancelEdit()" class="px-3 py-1 bg-gray-600 rounded">Cancelar</button>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  newName = '';
  newDescription = '';

  editId: string | null = null;
  editNameVal = '';
  editDescVal = '';

  constructor(private blog: BlogService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.blog.getCategories().subscribe((res: any) => {
      this.categories = Array.isArray(res) ? res : (res.data || res);
    }, () => {
      this.categories = [];
    });
  }

  create() {
    if (!this.newName.trim()) return;
    this.blog.createCategory({ name: this.newName.trim(), description: this.newDescription.trim() }).subscribe(() => {
      this.newName = '';
      this.newDescription = '';
      this.load();
    });
  }

  startEdit(c: any) {
    this.editId = c._id;
    this.editNameVal = c.name;
    this.editDescVal = c.description;
  }

  saveEdit(id: string) {
    this.blog.updateCategory(id, { name: this.editNameVal, description: this.editDescVal }).subscribe(() => {
      this.editId = null;
      this.load();
    });
  }

  cancelEdit() {
    this.editId = null;
  }

  remove(id?: string) {
    if (!id) return;
    if (!confirm('¿Borrar categoría? Esta acción no se puede deshacer.')) return;
    this.blog.deleteCategory(id).subscribe(() => this.load());
  }
}
