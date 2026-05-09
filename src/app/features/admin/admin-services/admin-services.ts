import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast';
import { BarberServiceService } from '../../../core/services/barber-service';
import { BarberService, BarberServiceRequest } from '../../../shared/models/barber-service.model';
import { Alert } from '../../../shared/components/alert/alert';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    CurrencyPipe,
    Alert
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

  constructor(
    private readonly barberServiceService: BarberServiceService,
    private readonly toastService: ToastService
  ) { }

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
        this.handleError(error, 'No se pudieron cargar los servicios.');
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
        this.toastService.success('Servicio creado correctamente.');
        this.resetForm();
        this.loadServices();
      },
      error: (error) => {
        console.error('CREATE SERVICE ERROR:', error);
        this.saving = false;
        this.handleError(error, 'No se pudo crear el servicio.');
      }
    });
  }

  updateService(id: number, request: BarberServiceRequest): void {
    this.barberServiceService.updateService(id, request).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Servicio actualizado correctamente.');
        this.resetForm();
        this.loadServices();
      },
      error: (error) => {
        console.error('UPDATE SERVICE ERROR:', error);
        this.saving = false;
        this.handleError(error, 'No se pudo actualizar el servicio.');
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

    this.barberServiceService.activateService(service.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.toastService.success('Servicio activado correctamente.');
        this.loadServices();
      },
      error: (error) => {
        console.error('ACTIVATE SERVICE ERROR:', error);
        this.changingStatusId = null;
        this.handleError(error, 'No se pudo activar el servicio.');
      }
    });
  }

  deactivateService(service: BarberService): void {
    this.changingStatusId = service.id;
    this.errorMessage = '';

    this.barberServiceService.deactivateService(service.id).subscribe({
      next: () => {
        this.changingStatusId = null;
        this.toastService.success('Servicio desactivado correctamente.');
        this.loadServices();
      },
      error: (error) => {
        console.error('DEACTIVATE SERVICE ERROR:', error);
        this.changingStatusId = null;
        this.handleError(error, 'No se pudo desactivar el servicio.');
      }
    });
  }

  resetForm(): void {
    this.editingServiceId = null;
    this.form = this.getEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
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

  /**
   * Centraliza el manejo de errores HTTP para mostrar mensajes precisos
   */
  private handleError(error: any, defaultMessage: string): void {
    if (error.status === 401) {
      this.errorMessage = 'Tu sesión expiró o no se envió el token. Cierra sesión e inicia nuevamente.';
      return;
    }

    if (error.status === 403) {
      this.errorMessage = 'Tu usuario no tiene permisos de administrador para esta acción.';
      return;
    }

    this.errorMessage = error?.error?.message || `${defaultMessage} Status: ${error?.status || 'Unknown'}`;
  }
}