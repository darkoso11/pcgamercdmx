import { Component } from '@angular/core';
import { ProductsSliderComponent } from './products-slider.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductsSliderComponent],
  templateUrl: './products.component.html'
})
export class ProductsComponent {
  // ...otras propiedades...

  // Agrega esta propiedad para evitar el error en el template
  pcBuilds = [
    { img: 'assets/img/placeholder-pc1.png', link: '/productos/1' },
    { img: 'assets/img/placeholder-pc2.png', link: '/productos/2' }
  ];
  pcIndex = 0;

  // ...tu array carruselProducts y lógica del slider...
  carruselProducts = [
    // ...tus productos...
  ];
  currentPage = 0;
  productsPerPage = 3;

  visibleProducts() {
    const start = this.currentPage * this.productsPerPage;
    return this.carruselProducts.slice(start, start + this.productsPerPage);
  }

  pageCount() {
    return Array(Math.ceil(this.carruselProducts.length / this.productsPerPage));
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
}
