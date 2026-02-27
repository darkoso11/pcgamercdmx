import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../blog/admin/admin-header.component';
import { ProductsAdminService } from './products-admin.service';

interface Category {
  name: string;
  description?: string;
  icon?: string;
  editing?: boolean;
}

@Component({
  selector: 'app-admin-categories-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-categories-manager.component.html'
})
export class AdminCategoriesManagerComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  newCategory: Category = { name: '', description: '', icon: '', editing: false };
  editingCategory: Category = { name: '', description: '', icon: '', editing: false };
  editingIndex = -1;
  products: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(private productsAdminService: ProductsAdminService) {
    // Inicializar con categorías por defecto
    this.categories = [
      { name: 'Gabinetes', description: 'Gabinetes para PC', icon: 'fa-box' },
      { name: 'Periféricos', description: 'Accesorios y periféricos', icon: 'fa-mouse' },
      { name: 'Componentes', description: 'Componentes internos', icon: 'fa-microchip' },
      { name: 'Ensambles de Computadoras', description: 'PCs armadas personalizadas', icon: 'fa-cube' }
    ];
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsAdminService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.products = Array.isArray(response) ? response : (response.data || []);
      });
  }

  addCategory(): void {
    if (!this.newCategory.name?.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    // Verificar que no exista
    if (this.categories.some((c) => c.name.toLowerCase() === this.newCategory.name!.toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }

    this.categories.push({
      name: this.newCategory.name,
      description: this.newCategory.description || '',
      icon: this.newCategory.icon || 'fa-folder'
    });

    this.newCategory = { name: '', description: '', icon: '', editing: false };
    alert('Categoría agregada correctamente');
  }

  startEditing(index: number): void {
    this.editingIndex = index;
    this.editingCategory = { ...this.categories[index] };
    this.categories[index].editing = true;
  }

  saveEdit(index: number): void {
    if (!this.editingCategory.name?.trim()) {
      alert('El nombre es requerido');
      return;
    }

    this.categories[index] = this.editingCategory;
    this.categories[index].editing = false;
    alert('Categoría actualizada correctamente');
  }

  cancelEdit(): void {
    if (this.editingIndex >= 0) {
      this.categories[this.editingIndex].editing = false;
    }
    this.editingIndex = -1;
    this.editingCategory = { name: '', description: '', icon: '', editing: false };
  }

  deleteCategory(index: number, categoryName: string): void {
    const productCount = this.getProductCount(categoryName);

    if (productCount > 0) {
      alert(`No se puede eliminar "${categoryName}" porque tiene ${productCount} producto(s) asignado(s).`);
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
      this.categories.splice(index, 1);
      alert('Categoría eliminada correctamente');
    }
  }

  moveCategoryUp(index: number): void {
    if (index > 0) {
      const temp = this.categories[index];
      this.categories[index] = this.categories[index - 1];
      this.categories[index - 1] = temp;
    }
  }

  moveCategoryDown(index: number): void {
    if (index < this.categories.length - 1) {
      const temp = this.categories[index];
      this.categories[index] = this.categories[index + 1];
      this.categories[index + 1] = temp;
    }
  }

  getProductCount(categoryName: string): number {
    return this.products.filter((p) => p.category === categoryName).length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
