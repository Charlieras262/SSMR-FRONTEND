import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GeneralService } from 'src/app/services/general.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {

  recoverPasswordForm: FormGroup;
  step = 0;
  hidePass = true;
  hidePassConf = true;
  hasSpecialChar = false;
  hasUppercaseChar = false;
  hasNumberChar = false;
  minMaxChar = false;

  constructor(
    private spinner: NgxSpinnerService,
    private generalService: GeneralService,
    private router: Router
  ) {
    this.recoverPasswordForm = new FormGroup({
      email: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
  }

  requestRecoverPassword() {
    this.spinner.show();
    const user = this.recoverPasswordForm.get('email');
    this.generalService.postData(`${environment.api}/external/users/request/recover/password/${user?.value}`).toPromise().then(_ => {
      this.recoverPasswordForm.addControl('token', new FormControl(null, Validators.required));
      this.step = 1;
      Swal.fire({
        title: '¡Enviado!',
        text: `Se ha enviado un correo de reestablecimiento de contraseña al usuario: ${user?.value}, por favor revisa su bandeja.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2b317f'
      });
    }).catch(_ => {
      user?.setErrors({ notFound: true });
      Swal.fire({
        title: '¡Error!',
        text: 'Error al intentar enviar el código de recuperación',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2b317f'
      });
    }).finally(() => this.spinner.hide());
  }

  recoverPassword() {
    this.spinner.show();
    const token = this.recoverPasswordForm.get('token');
    const user = this.recoverPasswordForm.get('email');
    this.generalService.postData(`${environment.api}/external/users/request/recover/validate/${user?.value}/${token?.value}`).toPromise().then(_ => {
      this.recoverPasswordForm.addControl('pass', new FormControl(null, Validators.required));
      this.recoverPasswordForm.addControl('passConf', new FormControl(null, Validators.required));
      this.step = 2;
      this.recoverPasswordForm.controls.pass.valueChanges.subscribe((value: string) => {
        if (value != null) {
          this.hasSpecialChar = value.match(/[$&+,:;=?@#!]+/) != null;
          this.hasUppercaseChar = value.match(/[A-Z]+/) != null;
          this.hasNumberChar = value.match(/[0-9]+/) != null;
          this.minMaxChar = value.length >= 8 && value.length <= 16
        }
      })
    }).catch(_ => {
      token?.setErrors({ notFound: true });
      Swal.fire({
        title: '¡Error!',
        text: 'Token no valido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2b317f'
      });
    }).finally(() => this.spinner.hide());
  }

  changePassword() {
    const token = this.recoverPasswordForm.get('token');
    const user = this.recoverPasswordForm.get('email');
    const pass = this.recoverPasswordForm.get('pass');
    const passConf = this.recoverPasswordForm.get('passConf');

    if (pass?.value !== passConf?.value) {
      passConf?.setErrors({ notMatch: true });
      Swal.fire({
        title: '¡Error!',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2b317f'
      });
      return;
    }

    this.spinner.show();

    const body = {
      username: user?.value,
      password: pass?.value,
    };

    this.generalService.patchData(`${environment.api}/external/users/recover/password`, token?.value, body).toPromise().then(_ => {
      this.recoverPasswordForm.addControl('pass', new FormControl(null, Validators.required));
      this.recoverPasswordForm.addControl('passConf', new FormControl(null, Validators.required));

      this.router.navigate(['/login']);
    }).catch(_ => {
      token?.setErrors({ notFound: true });
      Swal.fire({
        title: '¡Error!',
        text: 'Lo sentimos, no pudimos actualizar la contrase. Por favor, intente más tarde.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2b317f'
      });
    }).finally(() => this.spinner.hide());
  }
}
