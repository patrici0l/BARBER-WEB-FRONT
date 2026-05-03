import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../../core/services/appointment';
import { Appointment } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    RouterLink
  ],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss'
})
export class MyAppointments implements OnInit {

  appointments: Appointment[] = [];
  loading = false;
  cancellingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly appointmentService: AppointmentService) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error('MY APPOINTMENTS ERROR:', error);
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Debes iniciar sesión para ver tus reservas.';
          return;
        }

        this.errorMessage =
          error?.error?.message ||
          `No se pudieron cargar tus reservas. Status: ${error?.status}`;
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status !== 'BOOKED') {
      return;
    }

    const confirmed = confirm('¿Seguro que deseas cancelar esta reserva?');

    if (!confirmed) {
      return;
    }

    this.cancellingId = appointment.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.successMessage = 'Reserva cancelada correctamente.';
        this.loadAppointments();
      },
      error: (error) => {
        console.error('CANCEL APPOINTMENT ERROR:', error);
        this.cancellingId = null;

        this.errorMessage =
          error?.error?.message ||
          `No se pudo cancelar la reserva. Status: ${error?.status}`;
      }
    });
  }

  getServiceName(appointment: Appointment): string {
    return appointment.service?.name || appointment.serviceName || 'Servicio';
  }

  getStatusLabel(status: string): string {
    if (status === 'BOOKED') {
      return 'Reservada';
    }

    if (status === 'CANCELLED') {
      return 'Cancelada';
    }

    if (status === 'COMPLETED') {
      return 'Completada';
    }

    return status;
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status === 'BOOKED';
  }
}