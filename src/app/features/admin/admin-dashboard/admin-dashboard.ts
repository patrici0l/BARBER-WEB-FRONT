import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../../core/services/appointment';
import { Appointment } from '../../../shared/models/appointment.model';
import { Alert } from '../../../shared/components/alert/alert';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    Alert,
    FormsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  // --- Estado de datos ---
  appointments: Appointment[] = [];
  loading = false;
  cancellingId: number | null = null;
  completingId: number | null = null;

  // --- Filtros ---
  statusFilter = 'ALL';
  dateFilter = '';
  searchTerm = '';

  // --- Mensajes de feedback ---
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.appointmentService.getAdminAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error('ADMIN APPOINTMENTS ERROR:', error);
        this.loading = false;
        this.handleError(error, 'No se pudieron cargar las reservas.');
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status !== 'BOOKED') return;
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;

    this.cancellingId = appointment.id;
    this.errorMessage = '';

    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.toastService.success('Reserva cancelada correctamente.');
        this.loadAppointments();
      },
      error: (error) => {
        console.error('CANCEL APPOINTMENT ERROR:', error);
        this.cancellingId = null;
        this.handleError(error, 'Error al cancelar la reserva.');
      }
    });
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any, defaultMessage: string): void {
    if (error.status === 401) {
      this.errorMessage = 'Tu sesión expiró o no se envió el token. Cierra sesión e inicia nuevamente.';
      return;
    }

    if (error.status === 403) {
      this.errorMessage = 'Tu usuario no tiene permisos de administrador para realizar esta acción.';
      return;
    }

    this.errorMessage = error?.error?.message || `${defaultMessage} (Status: ${error?.status || '0'})`;

    // Si es un error crítico (como cancelar), también mostramos un toast
    if (defaultMessage.includes('Error al cancelar')) {
      this.toastService.error(this.errorMessage);
    }
  }

  completeAppointment(appointment: Appointment): void {
    if (appointment.status !== 'BOOKED') return;
    if (!confirm('¿Seguro que deseas marcar esta reserva como completada?')) return;

    this.completingId = appointment.id;
    this.errorMessage = '';

    this.appointmentService.completeAppointment(appointment.id).subscribe({
      next: () => {
        this.completingId = null;
        this.toastService.success('Reserva completada correctamente.');
        this.loadAppointments();
      },
      error: (error) => {
        console.error('COMPLETE APPOINTMENT ERROR:', error);
        this.completingId = null;
        this.handleError(error, 'Error al completar la reserva.');
      }
    });
  }

  // --- Lógica de Scroll y Filtro Rápido ---
  showBookedInTable(): void {
    this.statusFilter = 'BOOKED';
    setTimeout(() => {
      const table = document.getElementById('appointments-table');
      table?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // --- Lógica de Tiempos y Próximas Reservas ---
  get nowDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }

  get nowTime(): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Guayaquil',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  }

  get upcomingAppointments(): Appointment[] {
    return this.appointments
      .filter((appointment) => {
        if (appointment.status !== 'BOOKED') return false;
        if (appointment.appointmentDate > this.nowDate) return true;
        if (appointment.appointmentDate === this.nowDate && appointment.startTime >= this.nowTime) {
          return true;
        }
        return false;
      })
      .sort((a, b) => {
        const dateComp = a.appointmentDate.localeCompare(b.appointmentDate);
        return dateComp !== 0 ? dateComp : a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);
  }

  // --- Getters de Estadísticas ---
  get totalAppointments(): number { return this.appointments.length; }
  get bookedAppointments(): number { return this.appointments.filter(a => a.status === 'BOOKED').length; }
  get cancelledAppointments(): number { return this.appointments.filter(a => a.status === 'CANCELLED').length; }
  get completedAppointments(): number { return this.appointments.filter(a => a.status === 'COMPLETED').length; }

  get todayDate(): string { return this.nowDate; }
  get todayAppointments(): Appointment[] {
    return this.appointments
      .filter(a => a.appointmentDate === this.todayDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  get bookedTodayAppointments(): Appointment[] {
    return this.todayAppointments.filter(a => a.status === 'BOOKED');
  }

  // --- Lógica de Tabla ---
  get filteredAppointments(): Appointment[] {
    return this.appointments.filter((appointment) => {
      const matchesStatus = this.statusFilter === 'ALL' || appointment.status === this.statusFilter;
      const matchesDate = !this.dateFilter || appointment.appointmentDate === this.dateFilter;
      const search = this.searchTerm.trim().toLowerCase();
      const matchesSearch = !search ||
        this.getServiceName(appointment).toLowerCase().includes(search) ||
        this.getClientName(appointment).toLowerCase().includes(search) ||
        this.getClientEmail(appointment).toLowerCase().includes(search);
      return matchesStatus && matchesDate && matchesSearch;
    });
  }

  get hasActiveFilters(): boolean {
    return this.statusFilter !== 'ALL' || !!this.dateFilter || !!this.searchTerm.trim();
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.dateFilter = '';
    this.searchTerm = '';
  }

  // --- Helpers ---
  getServiceName(a: Appointment): string { return a.service?.name || a.serviceName || 'Servicio'; }
  getClientName(a: Appointment): string { return a.userName || a.clientName || 'Cliente'; }
  getClientEmail(a: Appointment): string { return a.userEmail || a.clientEmail || 'Sin email'; }
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { 'BOOKED': 'Reservada', 'CANCELLED': 'Cancelada', 'COMPLETED': 'Completada' };
    return labels[status] || status;
  }
  canCancel(a: Appointment): boolean { return a.status === 'BOOKED'; }
  canComplete(a: Appointment): boolean { return a.status === 'BOOKED'; }
}
