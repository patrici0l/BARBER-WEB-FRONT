import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BusinessHourService } from '../../../core/services/business-hour';
import { BusinessHour, BusinessHourRequest, DayOfWeek } from '../../../shared/models/business-hour.model';

@Component({
  selector: 'app-admin-business-hours',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule
  ],
  templateUrl: './admin-business-hours.html',
  styleUrl: './admin-business-hours.scss'
})
export class AdminBusinessHours implements OnInit {

  businessHours: BusinessHour[] = [];

  loading = false;
  savingId: number | null = null;

  errorMessage = '';
  successMessage = '';

  readonly dayOrder: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ];

  ngOnInit(): void {
    this.loadBusinessHours();
  }

  constructor(private readonly businessHourService: BusinessHourService) {}

  loadBusinessHours(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.businessHourService.getAdminBusinessHours().subscribe({
      next: (businessHours) => {
        this.businessHours = this.sortBusinessHours(businessHours);
        this.loading = false;
      },
      error: (error) => {
        console.error('ADMIN BUSINESS HOURS ERROR:', error);
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para gestionar horarios.';
          return;
        }

        this.errorMessage =
          error?.error?.message ||
          `No se pudieron cargar los horarios. Status: ${error?.status}`;
      }
    });
  }

  saveBusinessHour(businessHour: BusinessHour): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (businessHour.active) {
      if (!businessHour.openTime || !businessHour.closeTime) {
        this.errorMessage = 'Si el día está activo, debes indicar hora de apertura y cierre.';
        return;
      }

      if (businessHour.openTime >= businessHour.closeTime) {
        this.errorMessage = 'La hora de apertura debe ser menor que la hora de cierre.';
        return;
      }
    }

    const request: BusinessHourRequest = {
      dayOfWeek: businessHour.dayOfWeek,
      openTime: businessHour.active ? businessHour.openTime : null,
      closeTime: businessHour.active ? businessHour.closeTime : null,
      active: businessHour.active
    };

    this.savingId = businessHour.id;

    this.businessHourService.updateBusinessHour(businessHour.id, request).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = `Horario de ${this.getDayLabel(businessHour.dayOfWeek)} actualizado correctamente.`;
        this.loadBusinessHours();
      },
      error: (error) => {
        console.error('UPDATE BUSINESS HOUR ERROR:', error);
        this.savingId = null;

        this.errorMessage =
          error?.error?.message ||
          `No se pudo actualizar el horario. Status: ${error?.status}`;
      }
    });
  }

  toggleActive(businessHour: BusinessHour): void {
    businessHour.active = !businessHour.active;

    if (!businessHour.active) {
      businessHour.openTime = null;
      businessHour.closeTime = null;
      return;
    }

    businessHour.openTime = businessHour.openTime || '09:00';
    businessHour.closeTime = businessHour.closeTime || '18:00';
  }

  getDayLabel(dayOfWeek: DayOfWeek): string {
    const labels: Record<DayOfWeek, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo'
    };

    return labels[dayOfWeek];
  }

  get activeDays(): number {
    return this.businessHours.filter(hour => hour.active).length;
  }

  get closedDays(): number {
    return this.businessHours.filter(hour => !hour.active).length;
  }

  private sortBusinessHours(businessHours: BusinessHour[]): BusinessHour[] {
    return [...businessHours].sort((a, b) => {
      return this.dayOrder.indexOf(a.dayOfWeek) - this.dayOrder.indexOf(b.dayOfWeek);
    });
  }
}