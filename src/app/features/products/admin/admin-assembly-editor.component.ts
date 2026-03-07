import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../admin/admin-header.component';
import { ProductsAdminService, Product } from './products-admin.service';

@Component({
  selector: 'app-admin-assembly-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-assembly-editor.component.html'
})
export class AdminAssemblyEditorComponent implements OnInit, OnDestroy {
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
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Ensambles de Computadoras', Validators.required],

      // Sección 2: Especificaciones Técnicas Completas
      processor: ['', Validators.required],
      motherboard: ['', Validators.required],
      graphicsCard: ['', Validators.required],
      ram: ['', Validators.required],
      nvmeSsd: ['', Validators.required],
      powerSupply: ['', Validators.required],
      cooling: ['', Validators.required],
      case: ['', Validators.required],
      operatingSystem: [''],

      // Sección 3: Precios
      price: [0, [Validators.required, Validators.min(0)]],
      discountPrice: [0],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      currency: ['MXN'],

      // Sección 4: Stock
      stock: [0, [Validators.required, Validators.min(0)]],
      sku: [''],

      // Sección 5: Imagen
      image: ['', Validators.required],
      gallery: [[]],

      // Sección 6: Publicación
      published: [false],
      featured: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadAssembly(params['id']);
      }
    });
  }

  loadAssembly(id: string): void {
    this.loading = true;
    this.productsAdminService
      .getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assembly: Product) => {
          if (assembly) {
            this.galleryImages = assembly.gallery || [];
            this.form.patchValue({
              title: assembly.title,
              slug: assembly.slug,
              description: assembly.description,
              category: assembly.categoryId || 'Ensambles de Computadoras',
              processor: assembly.modelo || '',
              motherboard: assembly.motherboard || '',
              graphicsCard: assembly.graphicsCard || '',
              ram: assembly.ram || '',
              nvmeSsd: assembly.nvmeSsd || '',
              powerSupply: assembly.powerSupply || '',
              cooling: assembly.cooling || '',
              case: assembly.case || '',
              operatingSystem: assembly.operatingSystem || '',
              price: assembly.price,
              discountPrice: assembly.discountPrice || 0,
              discountPercent: assembly.discountPercent || 0,
              currency: assembly.currency || 'MXN',
              stock: assembly.stock,
              sku: assembly.sku || '',
              image: assembly.image,
              gallery: assembly.gallery || [],
              published: assembly.published || false,
              featured: assembly.featured || false
            });
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.errorMessage = 'Error cargando el ensamble';
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

  saveAssembly(): void {
    if (this.form.invalid) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const assemblyData = { ...this.form.value, gallery: this.galleryImages };

    const operation = this.isEditMode
      ? this.productsAdminService.updateProduct(this.productId!, assemblyData)
      : this.productsAdminService.createProduct(assemblyData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: any) => {
        this.successMessage = this.isEditMode 
          ? 'Ensamble actualizado y publicado correctamente'
          : 'Ensamble creado y publicado correctamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/products']);
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = 'Error al publicar el ensamble';
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

    const assemblyData = { ...this.form.value, published: false, gallery: this.galleryImages };

    const operation = this.isEditMode
      ? this.productsAdminService.updateProduct(this.productId!, assemblyData)
      : this.productsAdminService.createProduct(assemblyData);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: any) => {
        this.successMessage = 'Ensamble guardado como borrador';
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

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.form.patchValue({ image: result });
      };
      reader.readAsDataURL(file);
    }
  }

  onGalleryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result as string;
          this.galleryImages.push(result);
        };
        reader.readAsDataURL(file);
      });
      input.value = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
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
