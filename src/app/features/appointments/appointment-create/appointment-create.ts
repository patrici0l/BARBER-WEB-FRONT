import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BarberServiceService } from '../../../core/services/barber-service';
import { AvailabilityService } from '../../../core/services/availability';
import { AppointmentService } from '../../../core/services/appointment';
import { Alert } from '../../../shared/components/alert/alert';
import { BarberService } from '../../../shared/models/barber-service.model';
import { AvailabilitySlot } from '../../../shared/models/availability-slot.model';
import { Appointment, AppointmentRequest } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    Alert
  ],
  templateUrl: './appointment-create.html',
  styleUrl: './appointment-create.scss'
})
export class AppointmentCreate implements OnInit {

  services: BarberService[] = [];
  slots: AvailabilitySlot[] = [];

  selectedServiceId: number | null = null;
  selectedDate = '';
  selectedStartTime = '';

  createdAppointment: Appointment | null = null;

  loadingServices = false;
  loadingAvailability = false;
  creatingAppointment = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly barberServiceService: BarberServiceService,
    private readonly availabilityService: AvailabilityService,
    private readonly appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.selectedDate = this.getToday();
    this.loadServices();
  }

  loadServices(): void {
    this.loadingServices = true;
    this.errorMessage = '';

    this.barberServiceService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loadingServices = false;
      },
      error: (error) => {
        console.error('LOAD SERVICES ERROR:', error);
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.loadingServices = false;
      }
    });
  }

  /**
   * Carga inicial de disponibilidad (limpia mensajes y estados previos)
   */
  loadAvailability(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.createdAppointment = null;
    this.selectedStartTime = '';
    this.slots = [];

    if (!this.selectedServiceId || !this.selectedDate) {
      this.errorMessage = 'Selecciona un servicio y una fecha.';
      return;
    }

    this.loadingAvailability = true;

    this.availabilityService.getAvailability(this.selectedDate, this.selectedServiceId).subscribe({
      next: (slots) => {
        this.slots = slots;
        this.loadingAvailability = false;
      },
      error: (error) => {
        console.error('LOAD AVAILABILITY ERROR:', error);
        this.errorMessage = 'No se pudo consultar la disponibilidad.';
        this.loadingAvailability = false;
      }
    });
  }

  /**
   * Refresca la disponibilidad después de crear una cita sin borrar los mensajes de éxito
   */
  refreshAvailabilityAfterCreate(): void {
    if (!this.selectedServiceId || !this.selectedDate) {
      return;
    }

    this.loadingAvailability = true;

    this.availabilityService.getAvailability(this.selectedDate, this.selectedServiceId).subscribe({
      next: (slots) => {
        this.slots = slots;
        this.loadingAvailability = false;
      },
      error: (error) => {
        console.error('REFRESH AVAILABILITY ERROR:', error);
        this.loadingAvailability = false;
      }
    });
  }

  selectSlot(slot: AvailabilitySlot): void {
    if (!slot.available || !slot.startTime) {
      this.errorMessage = 'Este horario no tiene una hora válida.';
      return;
    }

    this.selectedStartTime = slot.startTime;
    this.successMessage = '';
    this.errorMessage = '';
    this.createdAppointment = null;
  }

  createAppointment(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.createdAppointment = null;

    if (!this.selectedServiceId || !this.selectedDate || !this.selectedStartTime) {
      this.errorMessage = 'Selecciona servicio, fecha y horario.';
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para reservar.';
      return;
    }

    const request: AppointmentRequest = {
      serviceId: Number(this.selectedServiceId),
      appointmentDate: this.selectedDate,
      startTime: this.selectedStartTime
    };

    this.creatingAppointment = true;

    this.appointmentService.createAppointment(request).subscribe({
      next: (appointment) => {
        this.createdAppointment = appointment;
        this.successMessage = 'Reserva creada correctamente.';
        this.creatingAppointment = false;

        // Limpiamos la selección horaria pero mantenemos el servicio/fecha
        this.selectedStartTime = '';

        // Refrescamos los slots disponibles sin limpiar mensajes
        this.refreshAvailabilityAfterCreate();

        setTimeout(() => {
          const confirmation = document.getElementById('reservation-confirmation');
          confirmation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      },
      error: (error) => {
        console.error('CREATE APPOINTMENT ERROR:', error);
        this.creatingAppointment = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Tu sesión expiró o no tienes autorización. Inicia sesión nuevamente.';
          return;
        }

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          `No se pudo crear la reserva. Status: ${error?.status}`;
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  get selectedService(): BarberService | undefined {
    if (!this.selectedServiceId) {
      return undefined;
    }
    return this.services.find(service => service.id === Number(this.selectedServiceId));
  }

  getConfirmationServiceName(): string {
    return this.createdAppointment?.service?.name ||
      this.createdAppointment?.serviceName ||
      this.selectedService?.name ||
      'Servicio';
  }

  getConfirmationDate(): string {
    return this.createdAppointment?.appointmentDate || this.selectedDate;
  }

  getConfirmationStartTime(): string {
    return this.createdAppointment?.startTime || this.selectedStartTime;
  }

  getConfirmationEndTime(): string {
    return this.createdAppointment?.endTime || '';
  }

  private getToday(): string {
    const now = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    return now;
  }
}