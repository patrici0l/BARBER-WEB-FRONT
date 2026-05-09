import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast';
import { ProductService } from '../../../core/services/product';
import { Product, ProductRequest } from '../../../shared/models/product.model';
import { Alert } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    CurrencyPipe,
    Alert
  ],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProducts implements OnInit {

  products: Product[] = [];
  form: ProductRequest = this.getEmptyForm();

  editingProductId: number | null = null;
  loading = false;
  saving = false;
  changingStatusId: number | null = null;
  updatingStockId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly productService: ProductService,
    private readonly toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getAdminProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('ADMIN PRODUCTS ERROR:', error);
        this.loading = false;
        this.handleError(error, 'No se pudieron cargar los productos.');
      }
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.name || !this.form.description || (this.form.price === null || this.form.price === undefined) || (this.form.stock === null || this.form.stock === undefined)) {
      this.errorMessage = 'Completa todos los campos obligatorios.';
      return;
    }

    if (Number(this.form.price) <= 0) {
      this.errorMessage = 'El precio debe ser mayor a 0.';
      return;
    }

    if (Number(this.form.stock) < 0) {
      this.errorMessage = 'El stock no puede ser negativo.';
      return;
    }

    this.saving = true;

    const request: ProductRequest = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      price: Number(this.form.price),
      stock: Number(this.form.stock),
      imageUrl: this.form.imageUrl?.trim() || null,
      active: this.form.active ?? true
    };

    if (this.editingProductId) {
      this.updateProduct(this.editingProductId, request);
      return;
    }

    this.createProduct(request);
  }

  createProduct(request: ProductRequest): void {
    this.productService.createProduct(request).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Producto creado correctamente.');
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        console.error('CREATE PRODUCT ERROR:', error);
        this.saving = false;
        this.handleError(error, 'No se pudo crear el producto.');
      }
    });
  }

  updateProduct(id: number, request: ProductRequest): void {
    this.productService.updateProduct(id, request).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Producto actualizado correctamente.');
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        console.error('UPDATE PRODUCT ERROR:', error);
        this.saving = false;
        this.handleError(error, 'No se pudo actualizar el producto.');
      }
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      active: product.active
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  activateProduct(product: Product): void {
    this.changingStatusId = product.id;
    this.errorMessage = '';

    this.productService.activateProduct(product.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.toastService.success('Producto activado correctamente.');
        this.loadProducts();
      },
      error: (error) => {
        console.error('ACTIVATE PRODUCT ERROR:', error);
        this.changingStatusId = null;
        this.handleError(error, 'No se pudo activar el producto.');
      }
    });
  }

  deactivateProduct(product: Product): void {
    this.changingStatusId = product.id;
    this.errorMessage = '';

    this.productService.deactivateProduct(product.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.toastService.success('Producto desactivado correctamente.');
        this.loadProducts();
      },
      error: (error) => {
        console.error('DEACTIVATE PRODUCT ERROR:', error);
        this.changingStatusId = null;
        this.handleError(error, 'No se pudo desactivar el producto.');
      }
    });
  }

  updateStock(product: Product): void {
    const stockValue = prompt(`Nuevo stock para "${product.name}"`, String(product.stock));

    if (stockValue === null) return;

    const stock = Number(stockValue);
    if (Number.isNaN(stock) || stock < 0) {
      this.errorMessage = 'El stock ingresado no es válido.';
      return;
    }

    this.updatingStockId = product.id;
    this.errorMessage = '';

    this.productService.updateStock(product.id, { stock }).subscribe({
      next: () => {
        this.updatingStockId = null;
        this.toastService.success('Stock actualizado correctamente.');
        this.loadProducts();
      },
      error: (error) => {
        console.error('UPDATE STOCK ERROR:', error);
        this.updatingStockId = null;
        this.handleError(error, 'No se pudo actualizar el stock.');
      }
    });
  }

  resetForm(): void {
    this.editingProductId = null;
    this.form = this.getEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  get activeProducts(): number {
    return this.products.filter(p => p.active).length;
  }

  get inactiveProducts(): number {
    return this.products.filter(p => !p.active).length;
  }

  private getEmptyForm(): ProductRequest {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      active: true
    };
  }

  /**
   * Manejo centralizado de errores para mayor precisión
   */
  private handleError(error: any, defaultMessage: string): void {
    if (error.status === 401) {
      this.errorMessage = 'Tu sesión expiró o no se envió el token. Cierra sesión e inicia nuevamente.';
      return;
    }

    if (error.status === 403) {
      this.errorMessage = 'Tu usuario no tiene permisos de administrador para esta acción.';
      return;
    }

    // Si el backend envía un mensaje específico, lo usamos; si no, el default con el status
    this.errorMessage = error?.error?.message || `${defaultMessage} Status: ${error?.status || 'Unknown'}`;
  }
}