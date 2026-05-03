import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BarberServiceService } from '../../../core/services/barber-service';
import { BarberService } from '../../../shared/models/barber-service.model';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe,
    RouterLink
  ],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss'
})
export class ServiceList implements OnInit {

  services: BarberService[] = [];
  loading = false;
  errorMessage = '';

  constructor(private readonly barberServiceService: BarberServiceService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.errorMessage = '';

    this.barberServiceService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los servicios. Verifica que el backend esté encendido.';
        this.loading = false;
      }
    });
  }
}