import { Component, inject } from '@angular/core'; // Importa inject
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ToastMessage, ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, AsyncPipe],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  // Inyectamos el servicio directamente en la propiedad
  private readonly toastService = inject(ToastService);
  
  // Ahora "this.toastService" ya existe cuando se define toasts$
  readonly toasts$ = this.toastService.toasts$;

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getIcon(type: ToastMessage['type']): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '!';
      case 'warning': return '!';
      default: return 'i';
    }
  }
}