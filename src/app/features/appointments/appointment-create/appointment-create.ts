import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { BarberServiceService } from '../../../core/services/barber-service';
import { AvailabilityService } from '../../../core/services/availability';
import { AppointmentService } from '../../../core/services/appointment';
import { BusinessHourService } from '../../../core/services/business-hour';
import { Alert } from '../../../shared/components/alert/alert';
import { BarberService } from '../../../shared/models/barber-service.model';
import { AvailabilitySlot } from '../../../shared/models/availability-slot.model';
import { Appointment, AppointmentRequest } from '../../../shared/models/appointment.model';
import { BusinessHour, DayOfWeek } from '../../../shared/models/business-hour.model';

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
    TitleCasePipe,
    Alert
  ],
  templateUrl: './appointment-create.html',
  styleUrl: './appointment-create.scss'
})
export class AppointmentCreate implements OnInit {

  services: BarberService[] = [];
  businessHours: BusinessHour[] = [];
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
    private readonly appointmentService: AppointmentService,
    private readonly businessHourService: BusinessHourService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.selectedDate = this.getToday();
    this.loadBusinessHours();
    this.loadServices();

    // Pre-selecciona el servicio desde queryParams si existe
    this.route.queryParams.subscribe(params => {
      if (params['serviceId']) {
        this.selectedServiceId = Number(params['serviceId']);
        this.loadAvailability();
      }
    });
  }

  loadBusinessHours(): void {
    this.businessHourService.getBusinessHours().subscribe({
      next: (businessHours) => {
        this.businessHours = businessHours;
      },
      error: (error) => {
        console.error('LOAD BUSINESS HOURS ERROR:', error);
      }
    });
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

    this.businessHourService.getBusinessHours().subscribe({
      next: (businessHours) => {
        this.businessHours = businessHours;
        this.loadAvailabilityWithCurrentBusinessHours();
      },
      error: (error) => {
        console.error('REFRESH BUSINESS HOURS ERROR:', error);
        this.loadingAvailability = false;
        this.errorMessage = 'No se pudieron validar los días de atención.';
      }
    });
  }

  private loadAvailabilityWithCurrentBusinessHours(): void {
    if (this.isSelectedDateClosed) {
      this.loadingAvailability = false;
      this.errorMessage = `La barbería está cerrada el ${this.selectedDayLabel}. Elige otra fecha.`;
      return;
    }

    this.availabilityService.getAvailability(this.selectedDate, Number(this.selectedServiceId)).subscribe({
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

    if (this.isSelectedDateClosed) {
      this.errorMessage = `La barbería está cerrada el ${this.selectedDayLabel}. Elige otra fecha.`;
      this.selectedStartTime = '';
      this.slots = [];
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

  get selectedBusinessHour(): BusinessHour | undefined {
    return this.businessHours.find(hour => hour.dayOfWeek === this.selectedDayOfWeek);
  }

  get isSelectedDateClosed(): boolean {
    const businessHour = this.selectedBusinessHour;
    return !!this.selectedDate && !!businessHour && (!businessHour.active || !businessHour.openTime || !businessHour.closeTime);
  }

  get selectedDayLabel(): string {
    const labels: Record<DayOfWeek, string> = {
      MONDAY: 'lunes',
      TUESDAY: 'martes',
      WEDNESDAY: 'miércoles',
      THURSDAY: 'jueves',
      FRIDAY: 'viernes',
      SATURDAY: 'sábado',
      SUNDAY: 'domingo'
    };
    return labels[this.selectedDayOfWeek] || 'día seleccionado';
  }

  get selectedDayOfWeek(): DayOfWeek {
    if (!this.selectedDate) {
      return 'MONDAY';
    }

    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
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
