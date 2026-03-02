import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastr = inject(ToastrService);

  success(message: string, title?: string): void {
    this.toastr.success(message, title || 'Success', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }

  error(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error', {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
    });
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Warning', {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
    });
  }

  info(message: string, title?: string): void {
    this.toastr.info(message, title || 'Info', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }

  show(message: string, title?: string): void {
    this.toastr.show(message, title, {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }
}
