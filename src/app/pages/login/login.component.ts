import { NgIf } from '@angular/common';
import { Component, type OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../../shared/services/login.service';
import { Router, RouterModule } from '@angular/router';
import { AlertsService } from '../../shared/services/alerts.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  year = new Date().getFullYear();
  form!: FormGroup;
  email!: string;
  invalidLogin: boolean = false;
  invalidEmail: boolean = false;
  loading = {
    login: false,
    forgotPassword: false    
  }

  constructor(
    private loginService: LoginService, 
    private router: Router,
    private alertsService: AlertsService
  ) { }
  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  login(): void {
    if (this.form.valid) {
      console.log(this.form.value);
      this.loading.login = true;
      this.loginService.login(this.form.value).subscribe({
        next: (response: any) => {
          console.log(response);
          this.loading.login = false;
          localStorage.setItem('user', JSON.stringify(response.data));
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.alertsService.error('Credenciales incorrectas', 'El usuario y/o contraseña son incorrectos, inténtelo de nuevo.');
          this.loading.login = false;
        }
      });
    }
  }

  forgotPassword() {
    if (this.email) {
      this.invalidEmail = false;
      this.loading.forgotPassword = true;
      this.loginService.forgotPassword(this.email).subscribe({
        next: (response: any) => {
          console.log(response);
          this.loading.forgotPassword = false;
          const closeBtnModal = document.getElementById('forgotClose');
          closeBtnModal?.click();
          this.alertsService.success('Éxito', 'Se ha enviado un correo con instrucciones para restablecer su contraseña.');
        },
        error: (err) => {
          this.loading.forgotPassword = false;
          this.alertsService.error('Error', 'No se ha encontrador el correo enviado, intentelo de nuevo.');
        }
      });
    }
  }
  

  get username() { return this.form.get('username'); }
  get password() { return this.form.get('password'); }

}