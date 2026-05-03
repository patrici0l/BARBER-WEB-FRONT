import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BusinessHour, BusinessHourRequest, DayOfWeek } from '../../shared/models/business-hour.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessHourService {

  private readonly publicApiUrl = `${environment.apiUrl}/business-hours`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin/business-hours`;

  constructor(private readonly http: HttpClient) { }

  getBusinessHours(): Observable<BusinessHour[]> {
    return this.http.get<BusinessHour[]>(this.publicApiUrl);
  }

  getBusinessHourByDay(dayOfWeek: DayOfWeek): Observable<BusinessHour> {
    return this.http.get<BusinessHour>(`${this.publicApiUrl}/${dayOfWeek}`);
  }

  getAdminBusinessHours(): Observable<BusinessHour[]> {
    return this.http.get<BusinessHour[]>(this.adminApiUrl);
  }

  updateBusinessHour(id: number, request: BusinessHourRequest): Observable<BusinessHour> {
    return this.http.put<BusinessHour>(`${this.adminApiUrl}/${id}`, request);
  }

  updateBusinessHourByDay(dayOfWeek: DayOfWeek, request: BusinessHourRequest): Observable<BusinessHour> {
    return this.http.put<BusinessHour>(`${this.adminApiUrl}/day/${dayOfWeek}`, request);
  }
}