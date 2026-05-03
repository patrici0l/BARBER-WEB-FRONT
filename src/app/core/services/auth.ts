import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'accessToken';

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((response) => {
          this.saveToken(this.extractToken(response));
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap((response) => {
          this.saveToken(this.extractToken(response));
        })
      );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  isAdmin(): boolean {
    const token = this.getToken();

    if (!token || this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    const payload = this.decodeToken(token);

    if (!payload) {
      return false;
    }

    const role = payload.role || payload.authority || payload.roles || payload.authorities;

    if (typeof role === 'string') {
      return role === 'ADMIN' || role === 'ROLE_ADMIN';
    }

    if (Array.isArray(role)) {
      return role.includes('ADMIN') || role.includes('ROLE_ADMIN');
    }

    return false;
  }

  getUserEmail(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const payload = this.decodeToken(token);

    return payload?.sub || payload?.email || null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private extractToken(response: AuthResponse): string {
    return response.token || response.accessToken || '';
  }

  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

      return JSON.parse(decodedPayload);
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload?.exp) {
      return false;
    }

    const expirationTime = payload.exp * 1000;

    return Date.now() >= expirationTime;
  }
}