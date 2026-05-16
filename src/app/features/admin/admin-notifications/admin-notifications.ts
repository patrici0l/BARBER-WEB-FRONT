import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppointmentService } from '../../../core/services/appointment';
import { NotificationService } from '../../../core/services/notification';
import { ToastService } from '../../../core/services/toast';
import { Appointment } from '../../../shared/models/appointment.model';
import {
  ManualNotificationRequest,
  NotificationHistory,
  NotificationSettings,
  NotificationSettingsRequest
} from '../../../shared/models/notification.model';
import { Alert } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    FormsModule,
    Alert
  ],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.scss'
})
export class AdminNotifications implements OnInit {

  settings: NotificationSettingsRequest = {
    reminderMinutesBefore: 60,
    automaticEnabled: true,
    emailEnabled: true,
    whatsappEnabled: false,
    whatsappBusinessNumber: ''
  };

  appointments: Appointment[] = [];
  history: NotificationHistory[] = [];

  manual: ManualNotificationRequest = {
    appointmentId: 0,
    email: true,
    whatsapp: false,
    customEmail: '',
    customWhatsapp: '',
    message: ''
  };

  loading = false;
  saving = false;
  sending = false;
  errorMessage = '';

  constructor(
    private readonly notificationService: NotificationService,
    private readonly appointmentService: AppointmentService,
    private readonly toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';

    this.notificationService.getSettings().subscribe({
      next: (settings) => {
        this.settings = this.toRequest(settings);
        this.loadAppointments();
        this.loadHistory();
      },
      error: (error) => this.handleError(error, 'No se pudo cargar la configuracion de notificaciones.')
    });
  }

  loadAppointments(): void {
    this.appointmentService.getAdminAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments.filter(appointment => appointment.status === 'BOOKED');
        if (!this.manual.appointmentId && this.appointments.length > 0) {
          this.manual.appointmentId = this.appointments[0].id;
        }
        this.loading = false;
      },
      error: (error) => this.handleError(error, 'No se pudieron cargar las reservas.')
    });
  }

  loadHistory(): void {
    this.notificationService.getHistory().subscribe({
      next: (history) => this.history = history,
      error: (error) => this.handleError(error, 'No se pudo cargar el historial.')
    });
  }

  saveSettings(): void {
    if (this.settings.reminderMinutesBefore < 5 || this.settings.reminderMinutesBefore > 10080) {
      this.errorMessage = 'El aviso debe estar entre 5 minutos y 7 dias antes de la cita.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.notificationService.updateSettings(this.settings).subscribe({
      next: (settings) => {
        this.settings = this.toRequest(settings);
        this.saving = false;
        this.toastService.success('Configuracion de notificaciones guardada.');
      },
      error: (error) => this.handleError(error, 'No se pudo guardar la configuracion.')
    });
  }

  sendManual(): void {
    if (!this.manual.appointmentId) {
      this.errorMessage = 'Selecciona una reserva para notificar.';
      return;
    }

    if (!this.manual.email && !this.manual.whatsapp) {
      this.errorMessage = 'Selecciona al menos un canal: correo o WhatsApp.';
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    this.notificationService.sendManual(this.manual).subscribe({
      next: () => {
        this.sending = false;
        this.toastService.success('Notificacion manual procesada.');
        this.loadHistory();
      },
      error: (error) => this.handleError(error, 'No se pudo enviar la notificacion manual.')
    });
  }

  get selectedAppointment(): Appointment | undefined {
    return this.appointments.find(appointment => appointment.id === Number(this.manual.appointmentId));
  }

  get minutesPreview(): string {
    const minutes = this.settings.reminderMinutesBefore;
    if (minutes < 60) {
      return `${minutes} minutos antes`;
    }
    if (minutes % 1440 === 0) {
      return `${minutes / 1440} dia(s) antes`;
    }
    if (minutes % 60 === 0) {
      return `${minutes / 60} hora(s) antes`;
    }
    return `${minutes} minutos antes`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SENT: 'Enviada',
      SKIPPED: 'Omitida',
      FAILED: 'Fallida'
    };
    return labels[status] || status;
  }

  private toRequest(settings: NotificationSettings): NotificationSettingsRequest {
    return {
      reminderMinutesBefore: settings.reminderMinutesBefore,
      automaticEnabled: settings.automaticEnabled,
      emailEnabled: settings.emailEnabled,
      whatsappEnabled: settings.whatsappEnabled,
      whatsappBusinessNumber: settings.whatsappBusinessNumber || ''
    };
  }

  private handleError(error: any, defaultMessage: string): void {
    this.loading = false;
    this.saving = false;
    this.sending = false;
    this.errorMessage = error?.error?.message || `${defaultMessage} Status: ${error?.status || 'Unknown'}`;
  }
}
