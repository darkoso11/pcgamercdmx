import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../blog/admin/admin-header.component';
import { ProductsAdminService, Product, Category, Subcategory } from './products-admin.service';

// Tipos de producto disponibles
export interface ProductType {
  id: string;
  name: string;
  icon: string;
  specs: string[];
}

@Component({
  selector: 'app-admin-product-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-product-editor.component.html'
})
export class AdminProductEditorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  productId: string | null = null;
  galleryImages: string[] = [];
  newGalleryImage = '';

  // Categorías y subcategorías
  categorias: Category[] = [];
  subcategorias: Subcategory[] = [];
  selectedCategoryId: string | null = null;

  // Tipos de productos
  productTypes: ProductType[] = [
    {
      id: 'componente',
      name: 'Componente',
      icon: 'fa-microchip',
      specs: ['marca', 'modelo', 'especificaciones']
    },
    {
      id: 'periferico',
      name: 'Periférico',
      icon: 'fa-mouse',
      specs: ['marca', 'tipo', 'conexion']
    },
    {
      id: 'gabinete',
      name: 'Gabinete',
      icon: 'fa-box',
      specs: ['marca', 'tamaño', 'material', 'puertos']
    },
    {
      id: 'otro',
      name: 'Otro',
      icon: 'fa-cube',
      specs: ['marca', 'especificacion-personalizada']
    }
  ];

  // Marcas comunes
  marcas: string[] = [
    'Intel',
    'AMD',
    'NVIDIA',
    'ASUS',
    'MSI',
    'Gigabyte',
    'Corsair',
    'Kingston',
    'Samsung',
    'Seagate',
    'WD',
    'Logitech',
    'Razer',
    'SteelSeries',
    'Otro'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productsAdminService: ProductsAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({
      // Sección 1: Tipo y Marca
      productType: ['', Validators.required],
      brand: ['', Validators.required],

      // Sección 2: Categoría y Subcategoría
      categoryId: ['', Validators.required],
      subcategoryId: ['', Validators.required],

      // Sección 3: Información Básica
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]],

      // Sección 4: Especificaciones Dinámicas
      modelo: [''],
      tipo: [''],
      conexion: [''],
      tamaño: [''],
      material: [''],
      puertos: [''],
      especificacionPersonalizada: [''],

      // Sección 5: Precios
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [0],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      currency: ['MXN'],

      // Sección 6: Stock
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockAlert: [5, Validators.min(0)],
      sku: [''],

      // Sección 7: Medios
      image: ['', Validators.required],
      gallery: [[]],

      // Sección 8: SEO
      metaDescription: [''],
      keywords: [''],

      // Sección 9: Publicación
      published: [false],
      featured: [false],
      internalNotes: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.cargarProducto(params['id']);
      }
    });

    // Escuchar cambios en categoría para actualizar subcategorías
    this.form.get('categoryId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((categoryId) => {
      this.actualizarSubcategorias(categoryId);
      this.form.get('subcategoryId')?.reset();
    });
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
        }
      });
  }

  actualizarSubcategorias(categoryId: string): void {
    const categoria = this.categorias.find(c => c._id === categoryId);
    this.subcategorias = categoria?.subcategories || [];
    this.selectedCategoryId = categoryId;
  }

  cargarProducto(id: string): void {
    this.loading = true;
    this.productsAdminService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: any) => {
          if (product) {
            this.galleryImages = product.gallery || [];
            this.form.patchValue({
              productType: product.productType || '',
              brand: product.brand || '',
              categoryId: product.categoryId || '',
              subcategoryId: product.subcategoryId || '',
              title: product.title,
              slug: product.slug,
              description: product.description,
              modelo: product.modelo || '',
              tipo: product.tipo || '',
              conexion: product.conexion || '',
              tamaño: product.tamaño || '',
              material: product.material || '',
              puertos: product.puertos || '',
              especificacionPersonalizada: product.especificacionPersonalizada || '',
              price: product.price,
              discountPrice: product.discountPrice || 0,
              discountPercent: product.discountPercent || 0,
              currency: product.currency || 'MXN',
              stock: product.stock,
              lowStockAlert: product.lowStockAlert || 5,
              sku: product.sku || '',
              image: product.image,
              gallery: product.gallery || [],
              metaDescription: product.metaDescription || '',
              keywords: product.keywords ? product.keywords.join(', ') : '',
              published: product.published || false,
              featured: product.featured || false,
              internalNotes: product.internalNotes || ''
            });

            // Cargar categoría y actualizar subcategorías
            if (product.categoryId) {
              this.actualizarSubcategorias(product.categoryId);
            }
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.errorMessage = 'Error cargando el producto';
          console.error(err);
          this.loading = false;
        }
      });
  }

  generateSlug(): void {
    const title = this.form.get('title')?.value || '';
    if (title && !this.isEditMode) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.form.patchValue({ slug }, { emitEvent: false });
    }
  }

  saveProduct(): void {
    if (this.form.invalid) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData = {
      ...this.form.value,
      gallery: this.galleryImages,
      keywords: this.form.get('keywords')?.value?.split(',').map((k: string) => k.trim()) || []
    };

    const operation = this.isEditMode
      ? this.productsAdminService.updateProduct(this.productId!, productData)
      : this.productsAdminService.createProduct(productData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: any) => {
        this.successMessage = this.isEditMode 
          ? 'Producto actualizado y publicado correctamente'
          : 'Producto creado y publicado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = 'Error al publicar el producto';
        console.error(err);
        this.loading = false;
      }
    });
  }

  saveDraft(): void {
    if (this.form.get('title')?.invalid || this.form.get('slug')?.invalid) {
      alert('Por favor, completa al menos el título y el slug');
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const productData = {
      ...this.form.value,
      published: false,
      gallery: this.galleryImages,
      keywords: this.form.get('keywords')?.value?.split(',').map((k: string) => k.trim()) || []
    };

    const operation = this.isEditMode
      ? this.productsAdminService.updateProduct(this.productId!, productData)
      : this.productsAdminService.createProduct(productData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: any) => {
        this.successMessage = 'Producto guardado como borrador';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = 'Error al guardar el borrador';
        console.error(err);
        this.loading = false;
      }
    });
  }

  addGalleryImage(): void {
    if (this.newGalleryImage.trim()) {
      this.galleryImages.push(this.newGalleryImage);
      this.newGalleryImage = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
  }

  getSelectedProductType(): ProductType | undefined {
    const typeId = this.form.get('productType')?.value;
    return this.productTypes.find(t => t.id === typeId);
  }

  shouldShowSpec(specId: string): boolean {
    const selectedType = this.getSelectedProductType();
    return selectedType?.specs.includes(specId) || false;
  }

  getControl(controlName: string) {
    return this.form.get(controlName);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
