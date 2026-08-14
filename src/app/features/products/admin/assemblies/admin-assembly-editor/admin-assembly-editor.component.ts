import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, timeout } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import {
  PowerCertification,
  ProductsAdminService,
} from '../../shared/products-admin.service';
import {
  getCatalogSaveErrorMessage,
  isSupportedCatalogImageFile,
  prepareCatalogImagesForSave
} from '../../shared/catalog-image-save.utils';
import { asTrimmedText, normalizeCatalogSlug } from '../../shared/catalog-form.utils';

interface AssemblyBrandLogo {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-admin-assembly-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-assembly-editor.component.html'
})
export class AdminAssemblyEditorComponent implements OnInit, OnDestroy {
  readonly adminAssembliesUrl = adminUrl('assemblies');
  readonly brandOptions: ReadonlyArray<AssemblyBrandLogo> = [
    { src: 'assets/img/marcas/nvidia_tag.svg', alt: 'NVIDIA' },
    { src: 'assets/img/marcas/intel_tag.svg', alt: 'Intel' },
    { src: 'assets/img/marcas/ryzen_tag.svg', alt: 'AMD' },
    { src: 'assets/img/marcas/asuspng.png', alt: 'ASUS' },
    { src: 'assets/img/marcas/corsairbrand.png', alt: 'Corsair' },
    { src: 'assets/img/marcas/gigabyte.png', alt: 'Gigabyte' },
  ];
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  productId: string | null = null;
  galleryImages: string[] = [];
  powerCertifications: PowerCertification[] = [];
  showCertificationCreator = false;
  newCertificationName = '';
  newCertificationImagePreview = '';
  savingCertification = false;
  private selectedMainImageFile: File | null = null;
  private selectedGalleryImageFiles = new Map<string, File>();
  private selectedCertificationImageFile: File | null = null;

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
      // Sección 1: Información Básica
      title: ['', Validators.required],
      slug: [''],
      description: [''],
      category: ['Ensambles de Computadoras'],

      // Sección 2: Especificaciones Técnicas Completas
      processor: [''],
      motherboard: [''],
      graphicsCard: [''],
      ram: [''],
      nvmeSsd: [''],
      powerSupply: [''],
      watts: [0],
      powerCertificationId: [''],
      cooling: [''],
      fans: [''],
      case: [''],
      operatingSystem: [''],

      // Sección 3: Marcas visibles
      brandLogos: [[]],

      // Sección 4: Precios
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['MXN'],

      // Sección 5: Stock
      stock: [0],
      sku: [''],

      // Sección 6: Imagen
      image: ['', Validators.required],
      gallery: [[]],

      // Sección 7: Publicación
      featured: [false]
    });
  }

  ngOnInit(): void {
    this.loadPowerCertifications();
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
        next: (assembly: any) => {
          if (assembly) {
            this.galleryImages = assembly.gallery || [];
            this.form.patchValue({
              title: assembly.title,
              slug: assembly.slug,
              description: assembly.description,
              category: assembly.category || 'Ensambles de Computadoras',
              processor: assembly.processor || '',
              motherboard: assembly.motherboard || '',
              graphicsCard: assembly.graphicsCard || '',
              ram: assembly.ram || '',
              nvmeSsd: assembly.nvmeSsd || '',
              powerSupply: assembly.powerSupply || '',
              watts: assembly.watts || 0,
              powerCertificationId: assembly.powerCertificationId || '',
              cooling: assembly.cooling || '',
              fans: assembly.fans || '',
              case: assembly.case || '',
              operatingSystem: assembly.operatingSystem || '',
              brandLogos: this.normalizeBrandLogos(assembly.brandLogos),
              price: assembly.price,
              currency: assembly.currency || 'MXN',
              stock: assembly.stock,
              sku: assembly.sku || '',
              image: assembly.image,
              gallery: assembly.gallery || [],
              featured: assembly.featured || false
            });
          }
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Error cargando el ensamble';
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
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa los campos obligatorios antes de publicar el ensamble.';
      this.focusFirstInvalidControl();
      return;
    }

    const wasEditMode = this.isEditMode;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const assemblyData = this.buildAssemblyPayload(true);

    this.prepareImagesForSave(assemblyData)
      .pipe(
        switchMap((preparedAssemblyData) =>
          this.isEditMode
            ? this.productsAdminService.updateProduct(this.productId!, preparedAssemblyData)
            : this.productsAdminService.createProduct(preparedAssemblyData)
        ),
        timeout(20000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
      next: (result: any) => {
        if (!result) {
          this.errorMessage = this.isEditMode
            ? 'No se pudo actualizar el ensamble. Verifica tu sesion y vuelve a intentar.'
            : 'No se pudo crear el ensamble. Verifica tu sesion y vuelve a intentar.';
          this.cdr.detectChanges();
          return;
        }

        const savedId = String(result._id ?? '').trim();
        if (!wasEditMode && !savedId) {
          this.errorMessage = 'No se pudo crear el ensamble. Verifica tu sesion y vuelve a intentar.';
          this.cdr.detectChanges();
          return;
        }

        this.successMessage = this.isEditMode 
          ? 'Ensamble actualizado y publicado correctamente'
          : 'Ensamble creado y publicado correctamente';
        if (!wasEditMode) {
          this.keepCreatedAssemblyOpen(savedId);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = getCatalogSaveErrorMessage(err, 'Error al publicar el ensamble');
        this.cdr.detectChanges();
      }
    });
  }

  saveDraft(): void {
    const wasEditMode = this.isEditMode;
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const assemblyData = this.buildAssemblyPayload(false);

    this.prepareImagesForSave(assemblyData)
      .pipe(
        switchMap((preparedAssemblyData) =>
          this.isEditMode
            ? this.productsAdminService.updateProduct(this.productId!, preparedAssemblyData)
            : this.productsAdminService.createProduct(preparedAssemblyData)
        ),
        timeout(20000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
      next: (result: any) => {
        if (!result) {
          this.errorMessage = this.isEditMode
            ? 'No se pudo actualizar el ensamble. Verifica tu sesion y vuelve a intentar.'
            : 'No se pudo crear el ensamble. Verifica tu sesion y vuelve a intentar.';
          this.cdr.detectChanges();
          return;
        }

        const savedId = String(result._id ?? '').trim();
        if (!wasEditMode && !savedId) {
          this.errorMessage = 'No se pudo crear el ensamble. Verifica tu sesion y vuelve a intentar.';
          this.cdr.detectChanges();
          return;
        }

        this.successMessage = 'Ensamble guardado como borrador';
        if (!wasEditMode) {
          this.keepCreatedAssemblyOpen(savedId);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = getCatalogSaveErrorMessage(err, 'Error al guardar el borrador');
        this.cdr.detectChanges();
      }
    });
  }

  private keepCreatedAssemblyOpen(savedId: string): void {
    this.productId = savedId;
    this.isEditMode = true;
    this.router.navigate([adminUrl('assemblies'), savedId, 'edit']);
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!isSupportedCatalogImageFile(file)) {
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
        if (!isSupportedCatalogImageFile(file)) {
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

  onCertificationImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!isSupportedCatalogImageFile(file)) {
      this.errorMessage = 'Formato no permitido para la certificación. Usa JPG, JPEG, PNG, GIF o WebP.';
      input.value = '';
      return;
    }

    this.selectedCertificationImageFile = file;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      this.newCertificationImagePreview = String(loadEvent.target?.result ?? '');
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveNewCertification(): void {
    const name = this.newCertificationName.trim();
    if (!name || !this.selectedCertificationImageFile) {
      this.errorMessage = 'Escribe el nombre y selecciona la imagen de la certificación.';
      return;
    }

    this.savingCertification = true;
    this.errorMessage = '';
    this.productsAdminService
      .createPowerCertification(name, this.selectedCertificationImageFile)
      .pipe(
        finalize(() => {
          this.savingCertification = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (certification) => {
          this.powerCertifications = [
            ...this.powerCertifications.filter((item) => item._id !== certification._id),
            certification,
          ].sort((left, right) => left.sort - right.sort || left.name.localeCompare(right.name));
          this.form.get('powerCertificationId')?.setValue(certification._id ?? '');
          this.form.get('powerCertificationId')?.markAsDirty();
          this.cancelCertificationCreator();
        },
        error: () => {
          this.errorMessage = 'No se pudo registrar la certificación. El ensamble conserva sus datos.';
        },
      });
  }

  cancelCertificationCreator(): void {
    this.showCertificationCreator = false;
    this.newCertificationName = '';
    this.newCertificationImagePreview = '';
    this.selectedCertificationImageFile = null;
  }

  removeGalleryImage(index: number): void {
    const removedImage = this.galleryImages[index];
    if (removedImage) {
      this.selectedGalleryImageFiles.delete(removedImage);
    }
    this.galleryImages.splice(index, 1);
  }

  getControl(controlName: string) {
    return this.form.get(controlName);
  }

  isBrandSelected(brand: AssemblyBrandLogo): boolean {
    const selectedBrandKey = this.getBrandKey(brand);

    return this.normalizeBrandLogos(this.form.get('brandLogos')?.value)
      .some((logo) => this.getBrandKey(logo) === selectedBrandKey);
  }

  toggleBrandLogo(brand: AssemblyBrandLogo, selected: boolean): void {
    const control = this.form.get('brandLogos');
    const selectedBrandKey = this.getBrandKey(brand);
    const current = this.normalizeBrandLogos(control?.value)
      .filter((logo) => this.getBrandKey(logo) !== selectedBrandKey);
    const next = selected ? [...current, { ...brand }] : current;

    control?.setValue(next);
    control?.markAsDirty();
    control?.markAsTouched();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
    }
  }

  private prepareImagesForSave<T extends { image: string; gallery: string[] }>(data: T) {
    return prepareCatalogImagesForSave(
      data,
      this.selectedMainImageFile,
      this.selectedGalleryImageFiles,
      (file) => this.productsAdminService.uploadProductImage(file)
    );
  }

  private buildAssemblyPayload(published: boolean) {
    const rawValue = this.form.value;
    const fallbackName = `Ensamble ${Date.now()}`;
    const title = asTrimmedText(rawValue.title) || fallbackName;
    const slug = normalizeCatalogSlug(asTrimmedText(rawValue.slug) || title) || `ensamble-${Date.now()}`;

    const selectedCertification = this.powerCertifications.find(
      (certification) => certification._id === rawValue.powerCertificationId
    );

    return {
      ...rawValue,
      title,
      slug,
      description: asTrimmedText(rawValue.description),
      category: 'paquetes',
      processor: asTrimmedText(rawValue.processor),
      motherboard: asTrimmedText(rawValue.motherboard),
      graphicsCard: asTrimmedText(rawValue.graphicsCard),
      ram: asTrimmedText(rawValue.ram),
      nvmeSsd: asTrimmedText(rawValue.nvmeSsd),
      powerSupply: asTrimmedText(rawValue.powerSupply),
      watts: Number(rawValue.watts) || 0,
      powerCertificationId: asTrimmedText(rawValue.powerCertificationId),
      powerCertificate: selectedCertification?.name ?? '',
      powerCertificateImage: selectedCertification?.image ?? '',
      operatingSystem: asTrimmedText(rawValue.operatingSystem),
      cooling: asTrimmedText(rawValue.cooling),
      fans: asTrimmedText(rawValue.fans),
      case: asTrimmedText(rawValue.case),
      brandLogos: this.normalizeBrandLogos(rawValue.brandLogos),
      image: asTrimmedText(rawValue.image) || 'https://via.placeholder.com/600x400?text=Ensamble',
      published,
      gallery: this.galleryImages,
    };
  }

  private loadPowerCertifications(): void {
    this.productsAdminService
      .getPowerCertifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (certifications) => {
          this.powerCertifications = certifications;
          const currentId = asTrimmedText(this.form.get('powerCertificationId')?.value);
          if (!currentId && certifications.length === 1) {
            this.form.get('powerCertificationId')?.setValue(certifications[0]._id ?? '');
          }
        },
        error: () => {
          this.errorMessage = 'No se pudo cargar la biblioteca de certificaciones.';
        },
      });
  }

  private focusFirstInvalidControl(): void {
    const firstInvalidName = Object.keys(this.form.controls).find(
      (controlName) => this.form.get(controlName)?.invalid
    );
    if (!firstInvalidName || typeof document === 'undefined') return;

    setTimeout(() => {
      const element = document.querySelector<HTMLElement>(`[formControlName="${firstInvalidName}"]`);
      element?.focus();
    });
  }

  private normalizeBrandLogos(value: unknown): AssemblyBrandLogo[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((logo) => {
        const item = logo as Partial<AssemblyBrandLogo> & { logo?: unknown; name?: unknown };
        return {
          src: asTrimmedText(item.src ?? item.logo),
          alt: asTrimmedText(item.alt ?? item.name),
        };
      })
      .filter((logo) => logo.src && logo.alt)
      .filter(
        (logo, index, logos) =>
          logos.findIndex((item) => this.getBrandKey(item) === this.getBrandKey(logo)) === index
      );
  }

  private getBrandKey(brand: AssemblyBrandLogo): string {
    const identity = `${brand.alt} ${brand.src}`.toLowerCase();

    if (identity.includes('nvidia')) return 'nvidia';
    if (identity.includes('intel')) return 'intel';
    if (identity.includes('amd') || identity.includes('ryzen')) return 'amd';
    if (identity.includes('asus')) return 'asus';
    if (identity.includes('corsair')) return 'corsair';
    if (identity.includes('gigabyte')) return 'gigabyte';

    return brand.alt.toLowerCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
