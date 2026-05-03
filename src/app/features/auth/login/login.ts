import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';
import { LoginRequest } from '../../../shared/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  form: LoginRequest = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  submit(): void {
    this.errorMessage = '';

    if (!this.form.email || !this.form.password) {
      this.errorMessage = 'Ingresa tu email y contraseña.';
      return;
    }

    this.loading = true;

    this.authService.login(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/reservar');
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Credenciales incorrectas o usuario no registrado.';
      }
    });
  }
}