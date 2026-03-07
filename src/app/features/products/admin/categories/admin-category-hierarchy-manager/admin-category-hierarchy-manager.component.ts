import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { ProductsAdminService, Category, Subcategory } from '../../shared/products-admin.service';

@Component({
  selector: 'app-admin-category-hierarchy-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-category-hierarchy-manager.component.html'
})
export class AdminCategoryHierarchyManagerComponent implements OnInit, OnDestroy {
  categorias: Category[] = [];
  
  // Estados de edición
  newCategoryName = '';
  newCategoryDescription = '';
  newCategoryIcon = '';
  
  editingCategoryId: string | null = null;
  editingCategoryData = { name: '', description: '', icon: '' };
  
  editingSubcategoryData: { [key: string]: { name: string; description?: string; icon?: string } } = {};
  expandedCategories: Set<string> = new Set();
  
  newSubcategoryData: { [key: string]: { name: string; description: string; icon: string } } = {};
  showNewSubcategoryForm: { [key: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  constructor(private productsAdminService: ProductsAdminService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.productsAdminService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorias) => {
          this.categorias = categorias;
        },
        error: (err) => {
          console.error('Error cargando categorías:', err);
          alert('Error al cargar las categorías');
        }
      });
  }

  // ============ CATEGORÍAS PRINCIPALES ============

  agregarCategoria(): void {
    if (!this.newCategoryName.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    if (this.categorias.some(c => c.name.toLowerCase() === this.newCategoryName.toLowerCase())) {
      alert('Esta categoría ya existe');
      return;
    }

    const slugCategoria = this.generarSlug(this.newCategoryName);
    const nuevaCategoria: Omit<Category, '_id'> = {
      name: this.newCategoryName,
      slug: slugCategoria,
      description: this.newCategoryDescription,
      icon: this.newCategoryIcon || 'fa-folder',
      order: this.categorias.length + 1,
      subcategories: []
    };

    this.productsAdminService
      .createCategory(nuevaCategoria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarCategorias();
          this.newCategoryName = '';
          this.newCategoryDescription = '';
          this.newCategoryIcon = '';
          alert('Categoría creada correctamente');
        },
        error: (err) => {
          console.error('Error creando categoría:', err);
          alert('Error al crear la categoría');
        }
      });
  }

  iniciarEdicionCategoria(categoria: Category): void {
    this.editingCategoryId = categoria._id!;
    this.editingCategoryData = {
      name: categoria.name,
      description: categoria.description || '',
      icon: categoria.icon || ''
    };
  }

  guardarEdicionCategoria(): void {
    if (!this.editingCategoryData.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    this.productsAdminService
      .updateCategory(this.editingCategoryId!, this.editingCategoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarCategorias();
          this.editingCategoryId = null;
          alert('Categoría actualizada correctamente');
        },
        error: (err) => {
          console.error('Error actualizando categoría:', err);
          alert('Error al actualizar la categoría');
        }
      });
  }

  cancelarEdicionCategoria(): void {
    this.editingCategoryId = null;
    this.editingCategoryData = { name: '', description: '', icon: '' };
  }

  eliminarCategoria(categoria: Category): void {
    const productosEnCategoria = categoria.productCount || 0;
    if (productosEnCategoria > 0) {
      alert(`No se puede eliminar "${categoria.name}" porque tiene ${productosEnCategoria} producto(s) asignado(s).`);
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoria.name}" y todas sus subcategorías?`)) {
      this.productsAdminService
        .deleteCategory(categoria._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cargarCategorias();
            alert('Categoría eliminada correctamente');
          },
          error: (err) => {
            console.error('Error eliminando categoría:', err);
            alert('Error al eliminar la categoría');
          }
        });
    }
  }

  // ============ SUBCATEGORÍAS ============

  alternarExpansion(categoryId: string): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  mostrarFormularioNuevaSubcategoria(categoryId: string): void {
    this.showNewSubcategoryForm[categoryId] = !this.showNewSubcategoryForm[categoryId];
    if (this.showNewSubcategoryForm[categoryId]) {
      this.newSubcategoryData[categoryId] = { name: '', description: '', icon: '' };
    }
  }

  agregarSubcategoria(categoryId: string): void {
    const datos = this.newSubcategoryData[categoryId];
    
    if (!datos || !datos.name.trim()) {
      alert('El nombre de la subcategoría es requerido');
      return;
    }

    const categoria = this.categorias.find(c => c._id === categoryId);
    if (categoria && categoria.subcategories.some(s => s.name.toLowerCase() === datos.name.toLowerCase())) {
      alert('Esta subcategoría ya existe en esta categoría');
      return;
    }

    const slugSubcategoria = this.generarSlug(datos.name);
    const nuevaSubcategoria: Omit<Subcategory, '_id'> = {
      name: datos.name,
      slug: `${this.generarSlug(categoria!.name)}-${slugSubcategoria}`,
      description: datos.description,
      icon: datos.icon || 'fa-folder'
    };

    this.productsAdminService
      .addSubcategory(categoryId, nuevaSubcategoria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarCategorias();
          this.showNewSubcategoryForm[categoryId] = false;
          delete this.newSubcategoryData[categoryId];
          alert('Subcategoría creada correctamente');
        },
        error: (err) => {
          console.error('Error creando subcategoría:', err);
          alert('Error al crear la subcategoría');
        }
      });
  }

  iniciarEdicionSubcategoria(categoryId: string, subcategoria: Subcategory): void {
    const clave = `${categoryId}-${subcategoria._id}`;
    this.editingSubcategoryData[clave] = {
      name: subcategoria.name,
      description: subcategoria.description || '',
      icon: subcategoria.icon || ''
    };
  }

  guardarEdicionSubcategoria(categoryId: string, subcategoryId: string): void {
    const clave = `${categoryId}-${subcategoryId}`;
    const datos = this.editingSubcategoryData[clave];

    if (!datos || !datos.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    this.productsAdminService
      .updateSubcategory(categoryId, subcategoryId, datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cargarCategorias();
          delete this.editingSubcategoryData[clave];
          alert('Subcategoría actualizada correctamente');
        },
        error: (err) => {
          console.error('Error actualizando subcategoría:', err);
          alert('Error al actualizar la subcategoría');
        }
      });
  }

  cancelarEdicionSubcategoria(categoryId: string, subcategoryId: string): void {
    const clave = `${categoryId}-${subcategoryId}`;
    delete this.editingSubcategoryData[clave];
  }

  eliminarSubcategoria(categoryId: string, subcategoria: Subcategory): void {
    const productosEnSubcategoria = subcategoria.productCount || 0;
    if (productosEnSubcategoria > 0) {
      alert(`No se puede eliminar "${subcategoria.name}" porque tiene ${productosEnSubcategoria} producto(s) asignado(s).`);
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la subcategoría "${subcategoria.name}"?`)) {
      this.productsAdminService
        .deleteSubcategory(categoryId, subcategoria._id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.cargarCategorias();
            alert('Subcategoría eliminada correctamente');
          },
          error: (err) => {
            console.error('Error eliminando subcategoría:', err);
            alert('Error al eliminar la subcategoría');
          }
        });
    }
  }

  estaEditandoSubcategoria(categoryId: string, subcategoryId: string): boolean {
    const clave = `${categoryId}-${subcategoryId}`;
    return !!this.editingSubcategoryData[clave];
  }

  // ============ UTILIDADES ============

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
