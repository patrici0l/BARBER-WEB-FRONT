import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './alert.html',
  styleUrl: './alert.scss'
})
export class Alert {

  @Input() type: AlertType = 'info';
  @Input() message = '';
  @Input() linkText = '';
  @Input() linkTo = '';
  @Input() dismissible = true;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  get icon(): string {
    if (this.type === 'success') {
      return '✓';
    }

    if (this.type === 'error') {
      return '!';
    }

    if (this.type === 'warning') {
      return '!';
    }

    return 'i';
  }
}