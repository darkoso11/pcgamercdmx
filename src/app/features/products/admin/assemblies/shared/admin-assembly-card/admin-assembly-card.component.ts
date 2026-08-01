import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../shared/products-admin.service';

const MXN_PRICE_FORMATTER = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

@Component({
  selector: 'app-admin-assembly-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-assembly-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssemblyCardComponent {
  private assemblyValue!: Product;

  @Input({ required: true })
  set assembly(value: Product) {
    this.assemblyValue = value;
    this.imageFailed = false;
    this.specChips = [
      { label: 'CPU', value: value.processor ?? '' },
      { label: 'GPU', value: value.graphicsCard ?? '' },
      { label: 'RAM', value: value.ram ?? '' },
    ].filter((chip) => chip.value.trim().length > 0);
    this.stockLabel = this.buildStockLabel(value);
    this.formattedPrice = MXN_PRICE_FORMATTER.format(value.price);
  }

  get assembly(): Product {
    return this.assemblyValue;
  }

  @Input() managementMode = false;
  @Output() edit = new EventEmitter<string>();
  @Output() duplicate = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  imageFailed = false;
  specChips: Array<{ label: string; value: string }> = [];
  stockLabel = '';
  formattedPrice = '';

  private buildStockLabel(assembly: Product): string {
    if (assembly.stock <= 0) {
      return 'Sin stock';
    }

    if (assembly.stock <= assembly.lowStockAlert) {
      return `${assembly.stock} bajo stock`;
    }

    return `${assembly.stock} en stock`;
  }

  handleImageError(): void {
    this.imageFailed = true;
  }

  requestEdit(): void {
    this.edit.emit(this.assembly._id!);
  }

  requestDuplicate(): void {
    this.duplicate.emit(this.assembly._id!);
  }

  requestDelete(): void {
    this.delete.emit(this.assembly._id!);
  }
}
