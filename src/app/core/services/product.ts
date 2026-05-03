import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product, ProductRequest, StockUpdateRequest } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly publicApiUrl = `${environment.apiUrl}/products`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private readonly http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.publicApiUrl);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.publicApiUrl}/${id}`);
  }

  getAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.adminApiUrl);
  }

  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.adminApiUrl, request);
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.adminApiUrl}/${id}`, request);
  }

  activateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.adminApiUrl}/${id}/activate`, {});
  }

  deactivateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.adminApiUrl}/${id}/deactivate`, {});
  }

  updateStock(id: number, request: StockUpdateRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.adminApiUrl}/${id}/stock`, request);
  }
}