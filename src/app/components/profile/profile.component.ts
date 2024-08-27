import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserProfile } from 'src/app/models/UserDto';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  formGroup: FormGroup;
  profile: UserProfile | undefined;
  hasSpecialChar = false;
  hasUppercaseChar = false;
  hasNumberChar = false;
  minMaxChar = false;
  hideP = true;
  hidePc = true;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal
  ) {
    this.formGroup = new FormGroup({
      oldPass: new FormControl(null, Validators.required),
      newPass: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
    this.spinner.show();
    this.authService.getUserProfile().toPromise().then(res => {
      console.log(res);
      this.profile = res;
    }).finally(() => this.spinner.hide());

    this.formGroup.controls.newPass.valueChanges.subscribe((value: string) => {
      if (value != null) {
        this.hasSpecialChar = value.match(/[$&+,:;=?@#!]+/) != null;
        this.hasUppercaseChar = value.match(/[A-Z]+/) != null;
        this.hasNumberChar = value.match(/[0-9]+/) != null;
        this.minMaxChar = value.length >= 8 && value.length <= 16
      }
    })
  }

  openChangePassword(content: any) {
    this.modalService.open(content, { centered: true });
  }

  savePassword() {
    this.spinner.show();
    this.authService.changePassword(this.formGroup.value.oldPass, this.formGroup.value.newPass).toPromise().then(res => {
      this.modalService.dismissAll();
      if (res) {
        Swal.fire({
          title: "Credenciales actualizadas",
          text: "Su contraseña ha sido actualizada",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.formGroup.reset();
        this.hasSpecialChar = false;
        this.hasUppercaseChar = false;
        this.hasNumberChar = false;
        this.minMaxChar = false;
      } else {
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar cambiar la contraseña. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        })
      }
    }).catch(error => {
      console.log(error);
      if ([401, 403].includes(error.status)) {
        this.modalService.dismissAll();
      }

      if (error.status == 406) {
        Swal.fire({
          title: "Credenciales invalidas",
          text: "Por favor, revisa que la \"Ultima Contraseña\" ingresada sea correcta.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
        this.formGroup.controls.oldPass.setErrors({ valid: false })
      }

      if (`${error.status}`.includes('50')) {
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar comunicarse con el servidor. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        })
      }
    }).finally(() => this.spinner.hide())
  }

  parseRoles() {
    // Separates the roles by comma but add dont add comma use & before the last one
    return this.profile?.roles.map(role => role.name).join(', ').replace(/, ([^,]*)$/, ' & $1');
  }
}
