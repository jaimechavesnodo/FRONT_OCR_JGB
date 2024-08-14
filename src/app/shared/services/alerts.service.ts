import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  constructor() { }

  success(title: string, message: string) {
    this.alert('success', title, message);
  }

  error(title: string, message: string) {
    this.alert('error', title, message);
  }

  warning(title: string, message: string) {
    this.alert('warning', title, message);
  }

  info(title: string, message: string) {
    this.alert('info', title, message);
  }

  private alert(icon: SweetAlertIcon, title: string, message: string) {
    Swal.fire({
      icon: icon,
      title: title,
      text: message,
    });
  }

}
