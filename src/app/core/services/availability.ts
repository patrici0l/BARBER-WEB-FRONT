import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AvailabilitySlot } from '../../shared/models/availability-slot.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private readonly apiUrl = `${environment.apiUrl}/availability`;

  constructor(private readonly http: HttpClient) {}

  getAvailability(date: string, serviceId: number): Observable<AvailabilitySlot[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('serviceId', serviceId);

    return this.http.get<AvailabilitySlot[]>(this.apiUrl, { params });
  }
}