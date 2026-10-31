import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, of, switchMap, finalize, takeUntil } from 'rxjs';
import { AdminHeaderComponent } from '../../../admin/admin-header.component';
import { adminUrl } from '../../../admin/admin-route.config';
import { CatalogBrand } from '../../catalog-brands';
import { ProductsAdminService } from '../shared/products-admin.service';
import { isSupportedCatalogImageFile } from '../shared/catalog-image-save.utils';

@Component({
  selector: 'app-admin-brands', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-brands.component.html',
})
export class AdminBrandsComponent implements OnInit, OnDestroy {
  readonly productsUrl = adminUrl('products');
  readonly assembliesUrl = adminUrl('assemblies');
  brands: CatalogBrand[] = [];
  draft = { id: '', name: '', logo: '' };
  loading = false;
  saving = false;
  error = '';
  success = '';
  selectedFile: File | null = null;
  private destroy$ = new Subject<void>();
  constructor(private api: ProductsAdminService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getBrands().pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$)).subscribe({
      next: brands => this.brands = brands.sort((a, b) => a.name.localeCompare(b.name, 'es')),
      error: () => this.error = 'No se pudieron cargar las marcas. Reintenta o verifica el acceso al catálogo de marcas.',
    });
  }
  edit(brand: CatalogBrand): void {
    this.draft = { id: brand.id, name: brand.name, logo: brand.logo };
    this.selectedFile = null;
    this.success = '';
    this.error = '';
    document.getElementById('brand-name')?.focus();
  }
  reset(): void { this.draft = { id: '', name: '', logo: '' }; this.selectedFile = null; }
  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = null;
    if (file && (!isSupportedCatalogImageFile(file) || file.size > 5 * 1024 * 1024)) {
      this.error = 'Usa una imagen JPG, PNG, WebP o GIF de hasta 5 MB.';
    } else { this.selectedFile = file ?? null; this.error = ''; }
    input.value = '';
  }
  save(): void {
    if (this.saving || this.loading || !this.draft.name.trim()) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    const draft = { ...this.draft };
    const logo$ = this.selectedFile ? this.api.uploadProductImage(this.selectedFile) : of(draft.logo);
    logo$.pipe(switchMap(logo => this.api.saveBrand({ ...draft, id: draft.id || undefined, logo })),
      finalize(() => { this.saving = false; this.cdr.detectChanges(); }), takeUntil(this.destroy$)).subscribe({
      next: brand => {
        this.brands = [...this.brands.filter(item => item.id !== brand.id), brand].sort((a, b) => a.name.localeCompare(b.name, 'es'));
        this.success = draft.id ? 'Marca actualizada. Se conservan sus asociaciones.' : 'Marca creada. Ya puedes usarla en productos y ensambles.';
        this.reset();
      },
      error: error => this.error = error instanceof Error ? error.message : 'No se pudo guardar la marca. Revisa duplicados y permisos, y vuelve a intentar.',
    });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
