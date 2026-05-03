import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    RouterLink,
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
  completingId: number | null = null; // Añadido para feedback de completar

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
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para acceder al panel admin.';
          return;
        }
        this.errorMessage = error?.error?.message || `No se pudieron cargar las reservas.`;
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    if (appointment.status !== 'BOOKED') return;
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;

    this.cancellingId = appointment.id;
    this.appointmentService.cancelAppointment(appointment.id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.toastService.success('Reserva cancelada correctamente.');
        this.loadAppointments();
      },
      error: (error) => {
        this.cancellingId = null;
        this.toastService.error('Error al cancelar.');
      }
    });
  }

  // Método opcional si quieres implementar el botón completar del plan
  completeAppointment(appointment: Appointment): void {
    // Aquí iría tu lógica de servicio para completar
    this.toastService.info('Funcionalidad de completar en desarrollo');
  }

  // --- Lógica de Scroll y Filtro Rápido ---
  showBookedInTable(): void {
    this.statusFilter = 'BOOKED';
    setTimeout(() => {
      const table = document.getElementById('appointments-table');
      table?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // --- Lógica de Próximas Reservas (NUEVO) ---
  get nowDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  get nowTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
}