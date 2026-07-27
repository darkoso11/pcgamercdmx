import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import {
  calculateOfferPrice,
  CatalogDomain,
  findOfferConflicts,
  getOfferStatus,
  isProductInDomain,
} from '../../shared/admin-catalog-flow.utils';
import { Offer, Product, ProductsAdminService } from '../../shared/products-admin.service';

interface OfferFormValue {
  title: string;
  description: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  targetIds: string[];
  startDate: string;
  endDate: string;
  active: boolean;
  showBadge: boolean;
}

@Component({
  selector: 'app-admin-offers-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminHeaderComponent],
  templateUrl: './admin-offers-manager.component.html',
})
export class AdminOffersManagerComponent implements OnInit {
  readonly catalogDomain: CatalogDomain;
  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    description: new FormControl('', { nonNullable: true }),
    type: new FormControl<'percentage' | 'fixed'>('percentage', { nonNullable: true, validators: [Validators.required] }),
    discountValue: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    targetIds: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [(control) => Array.isArray(control.value) && control.value.length > 0 ? null : { required: true }],
    }),
    startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    endDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    active: new FormControl(true, { nonNullable: true }),
    showBadge: new FormControl(true, { nonNullable: true }),
  });

  offers: Offer[] = [];
  availableTargets: Product[] = [];
  editingOfferId: string | null = null;
  showForm = false;
  saving = false;
  message = '';
  errorMessage = '';

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    route: ActivatedRoute
  ) {
    this.catalogDomain = route.snapshot.data['catalogDomain'] === 'assemblies'
      ? 'assemblies'
      : 'products';
    this.resetForm();
  }

  get activeOffers(): number {
    return this.offers.filter((offer) => getOfferStatus(offer) === 'active').length;
  }

  get preview(): { basePrice: number; effectivePrice: number } | null {
    const target = this.availableTargets.find((item) =>
      this.form.controls.targetIds.value.includes(item._id ?? '')
    );
    if (!target || this.form.controls.discountValue.invalid) {
      return null;
    }

    return {
      basePrice: target.price,
      effectivePrice: calculateOfferPrice(target.price, {
        type: this.form.controls.type.value,
        discountValue: this.form.controls.discountValue.value,
      }),
    };
  }

  ngOnInit(): void {
    forkJoin({
      offers: this.productsAdminService.getOffersByDomain(this.catalogDomain, true),
      products: this.productsAdminService.getAllProducts(),
    }).subscribe({
      next: ({ offers, products }) => {
        this.offers = offers;
        this.availableTargets = products.data.filter((product) =>
          isProductInDomain(product, this.catalogDomain)
        );
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las ofertas de esta sección.';
      },
    });
  }

  startCreate(): void {
    this.editingOfferId = null;
    this.resetForm();
    this.showForm = true;
    this.message = '';
    this.errorMessage = '';
  }

  editOffer(offer: Offer): void {
    this.editingOfferId = offer._id ?? null;
    this.form.reset({
      title: offer.title,
      description: offer.description,
      type: offer.type === 'fixed' ? 'fixed' : 'percentage',
      discountValue: offer.discountValue,
      targetIds: this.catalogDomain === 'assemblies'
        ? [...(offer.applicableTo.packages ?? [])]
        : [...(offer.applicableTo.products ?? [])],
      startDate: this.toLocalInputValue(offer.startDate),
      endDate: this.toLocalInputValue(offer.endDate),
      active: offer.active,
      showBadge: offer.showBadge !== false,
    });
    this.showForm = true;
    this.message = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingOfferId = null;
    this.resetForm();
  }

  saveOffer(): void {
    this.message = '';
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Revisa los campos obligatorios de la oferta.';
      return;
    }

    const offer = this.buildOfferPayload();
    if (new Date(offer.endDate).getTime() <= new Date(offer.startDate).getTime()) {
      this.errorMessage = 'La fecha de finalización debe ser posterior al inicio.';
      return;
    }

    const candidate = { ...offer, _id: this.editingOfferId ?? undefined };
    const conflicts = findOfferConflicts(candidate, this.offers);
    if (conflicts.length) {
      this.errorMessage = `La oferta entra en conflicto con “${conflicts[0].title}”.`;
      return;
    }

    this.saving = true;
    const request = this.editingOfferId
      ? this.productsAdminService.updateOffer(this.editingOfferId, offer)
      : this.productsAdminService.createOffer(offer);

    request.pipe(finalize(() => this.saving = false)).subscribe({
      next: (savedOffer) => {
        if (!savedOffer) {
          this.errorMessage = 'Directus no devolvió la oferta guardada.';
          return;
        }
        this.upsertOffer(savedOffer);
        this.message = this.editingOfferId
          ? 'Oferta actualizada correctamente.'
          : 'Oferta creada correctamente.';
        this.showForm = false;
        this.editingOfferId = null;
        this.resetForm();
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar la oferta. Los datos permanecen en el formulario.';
      },
    });
  }

  toggleTarget(id: string, selected: boolean): void {
    const current = this.form.controls.targetIds.value.filter((item) => item !== id);
    this.form.controls.targetIds.setValue(selected ? [...current, id] : current);
    this.form.controls.targetIds.markAsTouched();
  }

  isTargetSelected(id: string): boolean {
    return this.form.controls.targetIds.value.includes(id);
  }

  toggleBadge(offer: Offer): void {
    if (!offer._id) return;
    this.productsAdminService.updateOffer(offer._id, { showBadge: !offer.showBadge }).subscribe({
      next: (updated) => {
        if (updated) this.upsertOffer(updated);
      },
      error: () => {
        this.errorMessage = 'No se pudo cambiar la visibilidad de la etiqueta.';
      },
    });
  }

  toggleActive(offer: Offer): void {
    if (!offer._id) return;
    const willActivate = !offer.active;
    if (willActivate) {
      const conflicts = findOfferConflicts({ ...offer, active: true }, this.offers);
      if (conflicts.length) {
        this.errorMessage = `No se puede activar: coincide con “${conflicts[0].title}”.`;
        return;
      }
    }

    const request = willActivate
      ? this.productsAdminService.activateOffer(offer._id)
      : this.productsAdminService.deactivateOffer(offer._id);
    request.subscribe({
      next: () => {
        offer.active = willActivate;
        this.offers = [...this.offers];
      },
      error: () => {
        this.errorMessage = 'No se pudo cambiar el estado de la oferta.';
      },
    });
  }

  statusLabel(offer: Offer): string {
    const labels = {
      scheduled: 'Programada',
      active: 'Activa',
      paused: 'Pausada',
      expired: 'Vencida',
    };
    return labels[getOfferStatus(offer)];
  }

  statusClass(offer: Offer): string {
    const classes = {
      scheduled: 'bg-cyan-500/15 text-cyan-200',
      active: 'bg-green-500/15 text-green-200',
      paused: 'bg-slate-500/15 text-slate-200',
      expired: 'bg-amber-500/15 text-amber-200',
    };
    return classes[getOfferStatus(offer)];
  }

  discountLabel(offer: Offer): string {
    return offer.type === 'percentage'
      ? `${offer.discountValue}% de descuento`
      : `$${offer.discountValue.toLocaleString('es-MX')} MXN de descuento`;
  }

  targetCount(offer: Offer): number {
    return (
      (offer.applicableTo.products?.length ?? 0) +
      (offer.applicableTo.packages?.length ?? 0) +
      (offer.applicableTo.categories?.length ?? 0)
    );
  }

  private buildOfferPayload(): Omit<Offer, '_id' | 'createdAt' | 'updatedAt'> {
    const value = this.form.getRawValue() as OfferFormValue;
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      catalogDomain: this.catalogDomain,
      type: value.type,
      discountValue: Number(value.discountValue),
      applicableTo: {
        products: this.catalogDomain === 'products' ? value.targetIds : [],
        packages: this.catalogDomain === 'assemblies' ? value.targetIds : [],
        categories: [],
      },
      startDate: new Date(value.startDate),
      endDate: new Date(value.endDate),
      active: value.active,
      showBadge: value.showBadge,
    };
  }

  private upsertOffer(offer: Offer): void {
    const index = this.offers.findIndex((item) => item._id === offer._id);
    this.offers = index === -1
      ? [offer, ...this.offers]
      : this.offers.map((item) => item._id === offer._id ? offer : item);
  }

  private resetForm(): void {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    this.form.reset({
      title: '',
      description: '',
      type: 'percentage',
      discountValue: 0,
      targetIds: [],
      startDate: this.toLocalInputValue(now),
      endDate: this.toLocalInputValue(end),
      active: true,
      showBadge: true,
    });
  }

  private toLocalInputValue(value: Date): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
}
