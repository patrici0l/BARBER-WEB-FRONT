import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  UserRole
} from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'accessToken';
  private readonly userKey = 'currentUser';

  constructor(private readonly http: HttpClient) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  saveSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);

    const currentUser: CurrentUser = {
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: this.normalizeRole(response.role)
    };

    localStorage.setItem(this.userKey, JSON.stringify(currentUser));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): CurrentUser | null {
    const rawUser = localStorage.getItem(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as CurrentUser;
    } catch {
      this.logout();
      return null;
    }
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
    if (!this.isAuthenticated()) {
      return false;
    }

    const currentUser = this.getCurrentUser();

    if (currentUser?.role === 'ADMIN') {
      return true;
    }

    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = this.decodeToken(token);
    const roleFromToken = payload?.role;

    return roleFromToken === 'ADMIN' || roleFromToken === 'ROLE_ADMIN';
  }

  getUserEmail(): string | null {
    const currentUser = this.getCurrentUser();

    if (currentUser?.email) {
      return currentUser.email;
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    const payload = this.decodeToken(token);
    return payload?.sub || payload?.email || null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // --- Métodos Privados de Utilidad ---

  private normalizeRole(role: string): UserRole {
    if (role === 'ROLE_ADMIN') {
      return 'ADMIN';
    }

    if (role === 'ROLE_CLIENT') {
      return 'CLIENT';
    }

    return role as UserRole;
  }

  /**
   * Decodifica el payload del JWT manejando caracteres UTF-8.
   * Referencia: image_8f5880.png
   */
  private decodeToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];

      if (!base64Url) {
        return null;
      }

      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(base64Url.length / 4) * 4, '=');

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('TOKEN DECODE ERROR:', error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000;
  }
}
