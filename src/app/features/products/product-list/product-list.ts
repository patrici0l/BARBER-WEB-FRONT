import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';

import { ProductService } from '../../../core/services/product';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-list',
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {

  products: Product[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los productos. Verifica que el backend esté encendido.';
        this.loading = false;
      }
    });
  }
}