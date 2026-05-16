import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Appointment, AppointmentRequest } from '../../shared/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private readonly apiUrl = `${environment.apiUrl}/appointments`;
  private readonly myAppointmentsUrl = `${environment.apiUrl}/my-appointments`;
  private readonly adminAppointmentsUrl = `${environment.apiUrl}/admin/appointments`;
  private readonly reservationsUrl = `${environment.apiUrl}/reservations`;

  constructor(private readonly http: HttpClient) { }

  createAppointment(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.reservationsUrl, request);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.myAppointmentsUrl);
  }

  getAdminAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.adminAppointmentsUrl);
  }

  cancelAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}/cancel`, {});
  }

  completeAppointment(id: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.adminAppointmentsUrl}/${id}/complete`, {});
  }
}
