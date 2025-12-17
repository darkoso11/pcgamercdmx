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
      <h2 class="text-2xl font-bold mb-4">Gestor de Categorías y Subcategorías</h2>

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
            <ng-container *ngFor="let c of categories">
              <tr class="align-top border-t border-white/5">
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
                    <button (click)="toggleSubcategories(c._id)" class="px-3 py-1 ml-2 bg-blue-500 rounded">{{ expanded[c._id] ? 'Ocultar' : 'Subcats' }}</button>
                  </ng-container>
                  <ng-container *ngIf="editId === c._id">
                    <button (click)="saveEdit(c._id)" class="px-3 py-1 mr-2 bg-green-500 rounded">Guardar</button>
                    <button (click)="cancelEdit()" class="px-3 py-1 bg-gray-600 rounded">Cancelar</button>
                  </ng-container>
                </td>
              </tr>
              <!-- Subcategories for expanded category -->
              <tr *ngIf="expanded[c._id]">
                <td colspan="3" class="py-2">
                  <div class="ml-8 p-3 bg-[#0a0f1a] rounded border border-white/5">
                    <h4 class="font-semibold mb-2">Subcategorías de {{ c.name }}</h4>
                    <div class="mb-3 p-2 bg-[#071229] rounded">
                      <div class="flex gap-2">
                        <input [(ngModel)]="newSubName[c._id]" placeholder="Nombre subcategoría" class="p-2 bg-[#0b1220] border border-white/10 rounded w-1/3" />
                        <input [(ngModel)]="newSubDesc[c._id]" placeholder="Descripción" class="p-2 bg-[#0b1220] border border-white/10 rounded flex-1" />
                        <button (click)="createSub(c._id)" class="px-4 py-2 bg-green-400 text-[#071029] rounded font-bold">Crear</button>
                      </div>
                    </div>
                    <table class="w-full table-auto text-sm">
                      <thead>
                        <tr class="text-left text-gray-400">
                          <th class="pb-1">Nombre</th>
                          <th class="pb-1">Descripción</th>
                          <th class="pb-1 w-32">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let s of getSubcategoriesFor(c._id)" class="border-t border-white/10">
                          <td class="py-2">
                            <ng-container *ngIf="editSubId !== s._id; else editSubName">
                              {{ s.name }}
                            </ng-container>
                            <ng-template #editSubName>
                              <input [(ngModel)]="editSubNameVal" class="p-1 bg-[#071229] border border-white/10 rounded w-full" />
                            </ng-template>
                          </td>
                          <td class="py-2">
                            <ng-container *ngIf="editSubId !== s._id; else editSubDesc">
                              {{ s.description }}
                            </ng-container>
                            <ng-template #editSubDesc>
                              <input [(ngModel)]="editSubDescVal" class="p-1 bg-[#071229] border border-white/10 rounded w-full" />
                            </ng-template>
                          </td>
                          <td class="py-2">
                            <ng-container *ngIf="editSubId !== s._id">
                              <button (click)="startEditSub(s)" class="px-2 py-1 mr-1 bg-yellow-400 text-[#071029] rounded text-xs">Editar</button>
                              <button (click)="removeSub(s._id)" class="px-2 py-1 bg-red-500 rounded text-xs">Borrar</button>
                            </ng-container>
                            <ng-container *ngIf="editSubId === s._id">
                              <button (click)="saveEditSub(s._id)" class="px-2 py-1 mr-1 bg-green-500 rounded text-xs">Guardar</button>
                              <button (click)="cancelEditSub()" class="px-2 py-1 bg-gray-600 rounded text-xs">Cancelar</button>
                            </ng-container>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  subcategories: any[] = [];
  newName = '';
  newDescription = '';

  editId: string | null = null;
  editNameVal = '';
  editDescVal = '';

  expanded: { [key: string]: boolean } = {};
  newSubName: { [key: string]: string } = {};
  newSubDesc: { [key: string]: string } = {};

  editSubId: string | null = null;
  editSubNameVal = '';
  editSubDescVal = '';

  constructor(private blog: BlogService) {}

  ngOnInit() {
    this.load();
    this.loadSubs();
  }

  load() {
    this.blog.getCategories().subscribe((res: any) => {
      this.categories = Array.isArray(res) ? res : (res.data || res);
    }, () => {
      this.categories = [];
    });
  }

  loadSubs() {
    this.blog.getSubCategories().subscribe((res: any) => {
      this.subcategories = Array.isArray(res) ? res : (res.data || res);
    }, () => {
      this.subcategories = [];
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

  toggleSubcategories(categoryId: string) {
    this.expanded[categoryId] = !this.expanded[categoryId];
    if (this.expanded[categoryId]) {
      this.loadSubs();
    }
  }

  getSubcategoriesFor(categoryId: string) {
    return this.subcategories.filter(s => s.categoryId === categoryId);
  }

  createSub(categoryId: string) {
    const name = this.newSubName[categoryId]?.trim();
    const desc = this.newSubDesc[categoryId]?.trim();
    if (!name) return;
    this.blog.createSubCategory({ name, categoryId, description: desc }).subscribe(() => {
      this.newSubName[categoryId] = '';
      this.newSubDesc[categoryId] = '';
      this.loadSubs();
    });
  }

  startEditSub(s: any) {
    this.editSubId = s._id;
    this.editSubNameVal = s.name;
    this.editSubDescVal = s.description;
  }

  saveEditSub(id: string) {
    this.blog.updateSubCategory(id, { name: this.editSubNameVal, description: this.editSubDescVal }).subscribe(() => {
      this.editSubId = null;
      this.loadSubs();
    });
  }

  cancelEditSub() {
    this.editSubId = null;
  }

  removeSub(id?: string) {
    if (!id) return;
    if (!confirm('¿Borrar subcategoría? Esta acción no se puede deshacer.')) return;
    this.blog.deleteSubCategory(id).subscribe(() => this.loadSubs());
  }
}
