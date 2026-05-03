import { Component, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe, NgFor, NgIf } from '@angular/common'; // Se agregó CurrencyPipe
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BarberServiceService } from '../../../core/services/barber-service';
import { AvailabilityService } from '../../../core/services/availability';
import { AppointmentService } from '../../../core/services/appointment';

import { BarberService } from '../../../shared/models/barber-service.model';
import { AvailabilitySlot } from '../../../shared/models/availability-slot.model';
import { AppointmentRequest } from '../../../shared/models/appointment.model';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    RouterLink,
    DatePipe,
    CurrencyPipe // Se agregó aquí para que el HTML lo reconozca
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

  loadingServices = false;
  loadingAvailability = false;
  creatingAppointment = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly barberServiceService: BarberServiceService,
    private readonly availabilityService: AvailabilityService,
    private readonly appointmentService: AppointmentService
  ) {}

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
      error: () => {
        this.errorMessage = 'No se pudieron cargar los servicios.';
        this.loadingServices = false;
      }
    });
  }

  loadAvailability(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedStartTime = '';
    this.slots = [];

    if (!this.selectedServiceId || !this.selectedDate) {
      return;
    }

    this.loadingAvailability = true;

    this.availabilityService.getAvailability(this.selectedDate, this.selectedServiceId).subscribe({
      next: (slots) => {
        this.slots = slots;
        this.loadingAvailability = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo consultar la disponibilidad.';
        this.loadingAvailability = false;
      }
    });
  }

  selectSlot(slot: AvailabilitySlot): void {
    if (!slot.available) {
      return;
    }

    this.selectedStartTime = slot.startTime;
    this.successMessage = '';
    this.errorMessage = '';
  }

  createAppointment(): void {
    this.successMessage = '';
    this.errorMessage = '';

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
      serviceId: this.selectedServiceId,
      appointmentDate: this.selectedDate,
      startTime: this.selectedStartTime
    };

    this.creatingAppointment = true;

    this.appointmentService.createAppointment(request).subscribe({
      next: () => {
        this.successMessage = 'Reserva creada correctamente.';
        this.creatingAppointment = false;
        this.loadAvailability();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'No se pudo crear la reserva.';
        this.creatingAppointment = false;
      }
    });
  }

  get selectedService(): BarberService | undefined {
    if (!this.selectedServiceId) {
      return undefined;
    }

    return this.services.find(service => service.id === Number(this.selectedServiceId));
  }

  private getToday(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  }
}