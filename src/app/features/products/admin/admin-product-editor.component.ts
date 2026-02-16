import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../blog/admin/admin-header.component';
import { ProductsAdminService, Product } from './products-admin.service';

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
      // Sección 1: Información Básica
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      category: ['', Validators.required],
      brand: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],

      // Sección 2: Especificaciones
      processor: [''],
      graphicsCard: [''],
      ram: [''],
      storage: [''],

      // Sección 3: Precios
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [0],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      currency: ['MXN'],

      // Sección 4: Stock
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockAlert: [5, Validators.min(0)],
      sku: [''],
      supplier: [''],

      // Sección 5: Medios
      image: ['', Validators.required],
      gallery: [[]],

      // Sección 6: SEO
      metaDescription: [''],
      keywords: [''],

      // Sección 7: Publicación
      published: [false],
      featured: [false],
      internalNotes: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProduct(params['id']);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productsAdminService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: any) => {
          if (product) {
            this.galleryImages = product.gallery || [];
            this.form.patchValue({
              title: product.title,
              slug: product.slug,
              category: product.category,
              brand: product.brand || '',
              description: product.description,
              processor: product.processor || '',
              graphicsCard: product.graphicsCard || '',
              ram: product.ram || '',
              storage: product.storage || '',
              price: product.price,
              discountPrice: product.discountPrice || 0,
              discountPercent: product.discountPercent || 0,
              currency: product.currency || 'MXN',
              stock: product.stock,
              lowStockAlert: product.lowStockAlert || 5,
              sku: product.sku || '',
              supplier: product.supplier || '',
              image: product.image,
              gallery: product.gallery || [],
              metaDescription: product.metaDescription || '',
              keywords: product.keywords || '',
              published: product.published || false,
              featured: product.featured || false,
              internalNotes: product.internalNotes || ''
            });
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

    const productData = { ...this.form.value, gallery: this.galleryImages };

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

    const productData = { ...this.form.value, published: false, gallery: this.galleryImages };

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

  getControl(controlName: string) {
    return this.form.get(controlName);
  }

  addGalleryImage(): void {
    if (this.newGalleryImage.trim()) {
      this.galleryImages.push(this.newGalleryImage.trim());
      this.form.patchValue({ gallery: this.galleryImages });
      this.newGalleryImage = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
    this.form.patchValue({ gallery: this.galleryImages });
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
