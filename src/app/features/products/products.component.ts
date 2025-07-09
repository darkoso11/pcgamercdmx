import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './products.component.html'
})
export class ProductsComponent {
  // ...otras propiedades...

  // Elimina el array carruselProducts de aquí, ya que debe estar en home.component.ts
  // Puedes recibirlo por Input, servicio, o importarlo si lo necesitas.
  // Deja solo la lógica del slider y métodos auxiliares.
  currentPage = 0;
  productsPerPage = 3;

  visibleProducts() {
    // Aquí deberías obtener los productos desde un servicio o Input
    // return this.carruselProducts.slice(...);
    return []; // Temporalmente vacío
  }

  pageCount() {
    // return Array(Math.ceil(this.carruselProducts.length / this.productsPerPage));
    return [];
  }

  prevProduct() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  nextProduct() {
    if (this.currentPage < this.pageCount().length - 1) {
      this.currentPage++;
    }
  }
  goToPage(i: number) {
    this.currentPage = i;
  }

  getProcessorIMG(processor: string): string {
    if (processor.toLowerCase().includes('intel')) {
      return 'assets/img/marcas/intel_tag.svg';
    }
    if (processor.toLowerCase().includes('ryzen') || processor.toLowerCase().includes('amd')) {
      return 'assets/img/marcas/ryzen_tag.svg';
    }
    return 'assets/img/marcas/nvidia_tag.svg';
  }

  getCaseIMG(caseName: string): string {
    if (caseName.toLowerCase().includes('3500x')) {
      return 'assets/img/gabinetes/3500X_LINK_BLK_01.webp';
    }
    if (caseName.toLowerCase().includes('balam rush tank')) {
      return 'assets/img/gabinetes/HBJNKHG+NM.png';
    }
    return 'assets/img/gabinetes/default.png';
  }
}
