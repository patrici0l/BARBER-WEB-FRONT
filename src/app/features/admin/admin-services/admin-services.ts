import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BarberServiceService } from '../../../core/services/barber-service';
import { BarberService, BarberServiceRequest } from '../../../shared/models/barber-service.model';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    CurrencyPipe
  ],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss'
})
export class AdminServices implements OnInit {

  services: BarberService[] = [];

  form: BarberServiceRequest = this.getEmptyForm();

  editingServiceId: number | null = null;
  loading = false;
  saving = false;
  changingStatusId: number | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(private readonly barberServiceService: BarberServiceService) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.barberServiceService.getAdminServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (error) => {
        console.error('ADMIN SERVICES ERROR:', error);
        this.loading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'No tienes permisos para gestionar servicios.';
          return;
        }

        this.errorMessage =
          error?.error?.message ||
          `No se pudieron cargar los servicios. Status: ${error?.status}`;
      }
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.name || !this.form.description || !this.form.price || !this.form.durationMinutes) {
      this.errorMessage = 'Completa todos los campos obligatorios.';
      return;
    }

    if (this.form.price <= 0) {
      this.errorMessage = 'El precio debe ser mayor a 0.';
      return;
    }

    if (this.form.durationMinutes <= 0) {
      this.errorMessage = 'La duración debe ser mayor a 0.';
      return;
    }

    this.saving = true;

    const request: BarberServiceRequest = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      price: Number(this.form.price),
      durationMinutes: Number(this.form.durationMinutes),
      active: this.form.active ?? true
    };

    if (this.editingServiceId) {
      this.updateService(this.editingServiceId, request);
      return;
    }

    this.createService(request);
  }

  createService(request: BarberServiceRequest): void {
    this.barberServiceService.createService(request).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Servicio creado correctamente.';
        this.resetForm();
        this.loadServices();
      },
      error: (error) => {
        console.error('CREATE SERVICE ERROR:', error);
        this.saving = false;
        this.errorMessage =
          error?.error?.message ||
          `No se pudo crear el servicio. Status: ${error?.status}`;
      }
    });
  }

  updateService(id: number, request: BarberServiceRequest): void {
    this.barberServiceService.updateService(id, request).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Servicio actualizado correctamente.';
        this.resetForm();
        this.loadServices();
      },
      error: (error) => {
        console.error('UPDATE SERVICE ERROR:', error);
        this.saving = false;
        this.errorMessage =
          error?.error?.message ||
          `No se pudo actualizar el servicio. Status: ${error?.status}`;
      }
    });
  }

  editService(service: BarberService): void {
    this.editingServiceId = service.id;

    this.form = {
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      active: service.active
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  activateService(service: BarberService): void {
    this.changingStatusId = service.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.barberServiceService.activateService(service.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.successMessage = 'Servicio activado correctamente.';
        this.loadServices();
      },
      error: (error) => {
        console.error('ACTIVATE SERVICE ERROR:', error);
        this.changingStatusId = null;
        this.errorMessage =
          error?.error?.message ||
          `No se pudo activar el servicio. Status: ${error?.status}`;
      }
    });
  }

  deactivateService(service: BarberService): void {
    this.changingStatusId = service.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.barberServiceService.deactivateService(service.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.successMessage = 'Servicio desactivado correctamente.';
        this.loadServices();
      },
      error: (error) => {
        console.error('DEACTIVATE SERVICE ERROR:', error);
        this.changingStatusId = null;
        this.errorMessage =
          error?.error?.message ||
          `No se pudo desactivar el servicio. Status: ${error?.status}`;
      }
    });
  }

  resetForm(): void {
    this.editingServiceId = null;
    this.form = this.getEmptyForm();
  }

  get activeServices(): number {
    return this.services.filter(service => service.active).length;
  }

  get inactiveServices(): number {
    return this.services.filter(service => !service.active).length;
  }

  private getEmptyForm(): BarberServiceRequest {
    return {
      name: '',
      description: '',
      price: 0,
      durationMinutes: 30,
      active: true
    };
  }
}