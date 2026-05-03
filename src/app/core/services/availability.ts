import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AvailabilitySlot, RawAvailabilitySlot } from '../../shared/models/availability-slot.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private readonly apiUrl = `${environment.apiUrl}/availability`;

  constructor(private readonly http: HttpClient) { }

  getAvailability(date: string, serviceId: number): Observable<AvailabilitySlot[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('serviceId', serviceId);

    return this.http.get<RawAvailabilitySlot[]>(this.apiUrl, { params })
      .pipe(
        map((slots) => slots.map((slot) => this.normalizeSlot(slot)))
      );
  }

  private normalizeSlot(slot: RawAvailabilitySlot): AvailabilitySlot {
    return {
      startTime: slot.startTime || slot.start || slot.time || '',
      endTime: slot.endTime || slot.end || '',
      available: slot.available
    };
  }
}