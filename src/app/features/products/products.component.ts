import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  constructor(private readonly router: Router) {}

  get isProductDetailRoute(): boolean {
    return /^\/productos\/(?!hardware-accesorios(?:[/?#]|$)|componentes(?:[/?#]|$)|perifericos(?:[/?#]|$))[^/?#]+/.test(this.router.url);
  }
}
