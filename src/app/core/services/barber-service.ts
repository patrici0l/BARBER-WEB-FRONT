import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BarberService, BarberServiceRequest } from '../../shared/models/barber-service.model';

@Injectable({
  providedIn: 'root'
})
export class BarberServiceService {

  private readonly publicApiUrl = `${environment.apiUrl}/services`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/services`;

  constructor(private readonly http: HttpClient) { }

  getServices(): Observable<BarberService[]> {
    return this.http.get<BarberService[]>(this.publicApiUrl);
  }

  getServiceById(id: number): Observable<BarberService> {
    return this.http.get<BarberService>(`${this.publicApiUrl}/${id}`);
  }

  getAdminServices(): Observable<BarberService[]> {
    return this.http.get<BarberService[]>(this.adminApiUrl);
  }

  createService(request: BarberServiceRequest): Observable<BarberService> {
    return this.http.post<BarberService>(this.adminApiUrl, request);
  }

  updateService(id: number, request: BarberServiceRequest): Observable<BarberService> {
    return this.http.put<BarberService>(`${this.adminApiUrl}/${id}`, request);
  }

  activateService(id: number): Observable<BarberService> {
    return this.http.patch<BarberService>(`${this.adminApiUrl}/${id}/activate`, {});
  }

  deactivateService(id: number): Observable<BarberService> {
    return this.http.patch<BarberService>(`${this.adminApiUrl}/${id}/deactivate`, {});
  }
}