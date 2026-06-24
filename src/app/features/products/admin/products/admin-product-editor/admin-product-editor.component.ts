import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import { ProductsAdminService, Product, Category, Subcategory } from '../../shared/products-admin.service';

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
  readonly adminProductsUrl = adminUrl('products');
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  productId: string | null = null;
  galleryImages: string[] = [];
  newGalleryImage = '';
  private selectedMainImageFile: File | null = null;
  private selectedGalleryImageFiles = new Map<string, File>();

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
    private router: Router,
    private cdr: ChangeDetectorRef
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
      pricingMode: ['manual'],
      syncProvider: [''],
      providerProductId: [''],
      providerSku: [''],
      lastPriceSyncedAt: [{ value: '', disabled: true }],
      lastSyncStatus: [{ value: '', disabled: true }],
      lastSyncError: [{ value: '', disabled: true }],

      // Sección 6: Stock
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockAlert: [5, Validators.min(0)],
      sku: [''],
      supplier: [''],

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
          const currentCategoryId = this.form.get('categoryId')?.value;
          if (currentCategoryId) {
            this.actualizarSubcategorias(currentCategoryId);
          }
          this.cdr.detectChanges();
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
              pricingMode: product.pricingMode || 'manual',
              syncProvider: product.syncProvider || '',
              providerProductId: product.providerProductId || '',
              providerSku: product.providerSku || '',
              lastPriceSyncedAt: product.lastPriceSyncedAt || '',
              lastSyncStatus: product.lastSyncStatus || '',
              lastSyncError: product.lastSyncError || '',
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
            }, { emitEvent: false });

            // Cargar categoría y actualizar subcategorías
            if (product.categoryId) {
              this.actualizarSubcategorias(product.categoryId);
            }
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = 'Error cargando el producto';
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
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
      ...this.form.getRawValue(),
      category: this.resolveSelectedCategorySlug(),
      gallery: this.galleryImages,
      keywords: this.form.get('keywords')?.value?.split(',').map((k: string) => k.trim()) || []
    };

    this.prepareImagesForSave(productData)
      .pipe(
        switchMap((preparedProductData) =>
          this.isEditMode
            ? this.productsAdminService.updateProduct(this.productId!, preparedProductData)
            : this.productsAdminService.createProduct(preparedProductData)
        ),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
      next: (result: any) => {
        const visibility = productData.published ? 'publico' : 'privado';
        this.successMessage = this.isEditMode
          ? `Producto actualizado como ${visibility}`
          : `Producto creado como ${visibility}`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate([this.adminProductsUrl]);
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = this.getSaveErrorMessage(err, 'Error al guardar el producto');
        console.error(err);
        this.cdr.detectChanges();
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
      ...this.form.getRawValue(),
      category: this.resolveSelectedCategorySlug(),
      published: false,
      gallery: this.galleryImages,
      keywords: this.form.get('keywords')?.value?.split(',').map((k: string) => k.trim()) || []
    };

    this.prepareImagesForSave(productData)
      .pipe(
        switchMap((preparedProductData) =>
          this.isEditMode
            ? this.productsAdminService.updateProduct(this.productId!, preparedProductData)
            : this.productsAdminService.createProduct(preparedProductData)
        ),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
      next: (result: any) => {
        this.successMessage = 'Producto guardado como privado';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate([this.adminProductsUrl]);
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = this.getSaveErrorMessage(err, 'Error al guardar el producto privado');
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  addGalleryImage(): void {
    if (this.newGalleryImage.trim()) {
      this.galleryImages.push(this.newGalleryImage);
      this.newGalleryImage = '';
    }
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!this.isSupportedImageFile(file)) {
        this.errorMessage = 'Formato no permitido. Usa JPG, JPEG, PNG, GIF o WebP.';
        input.value = '';
        this.cdr.detectChanges();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        const imageControl = this.form.get('image');
        this.selectedMainImageFile = file;
        imageControl?.setValue(result);
        imageControl?.markAsDirty();
        imageControl?.markAsTouched();
        imageControl?.updateValueAndValidity();
        this.errorMessage = '';
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onGalleryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (!this.isSupportedImageFile(file)) {
          this.errorMessage = 'Una o mas imagenes tienen un formato no permitido. Usa JPG, JPEG, PNG, GIF o WebP.';
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result as string;
          this.selectedGalleryImageFiles.set(result, file);
          this.galleryImages.push(result);
          this.errorMessage = '';
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
      input.value = '';
    }
  }

  removeGalleryImage(index: number): void {
    const removedImage = this.galleryImages[index];
    if (removedImage) {
      this.selectedGalleryImageFiles.delete(removedImage);
    }
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

  private resolveSelectedCategorySlug(): Product['category'] {
    const categoryId = this.form.get('categoryId')?.value;
    const category = this.categorias.find((item) => item._id === categoryId);
    const slug = category?.slug || categoryId;

    switch (slug) {
      case 'paquetes':
      case 'ensambles':
      case 'assembled':
        return 'paquetes';
      case 'perifericos':
      case 'peripheral':
        return 'perifericos';
      case 'componentes':
      case 'component':
      default:
        return 'componentes';
    }
  }

  private isSupportedImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileName = file.name.toLowerCase();

    return allowedTypes.includes(file.type) || allowedExtensions.some((extension) => fileName.endsWith(extension));
  }

  private prepareImagesForSave<T extends { image: string; gallery: string[] }>(data: T): Observable<T> {
    const mainImage$ = this.selectedMainImageFile
      ? this.productsAdminService.uploadProductImage(this.selectedMainImageFile)
      : of(data.image);

    const galleryUploads = data.gallery.map((image) => {
      const file = this.selectedGalleryImageFiles.get(image);
      return file ? this.productsAdminService.uploadProductImage(file) : of(image);
    });

    const gallery$ = galleryUploads.length > 0 ? forkJoin(galleryUploads) : of([]);

    return forkJoin({ image: mainImage$, gallery: gallery$ }).pipe(
      map(({ image, gallery }) => ({ ...data, image, gallery }))
    );
  }

  private getSaveErrorMessage(error: any, fallback: string): string {
    const status = error?.status;
    if (status === 401 || status === 403) {
      return `${fallback}. Tu sesion de Directus expiro o no tiene permisos; cierra sesion e ingresa de nuevo.`;
    }

    if (error?.name === 'TimeoutError') {
      return `${fallback}. Directus tardo demasiado en responder; intenta con una imagen mas ligera o vuelve a iniciar sesion.`;
    }

    return fallback;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
