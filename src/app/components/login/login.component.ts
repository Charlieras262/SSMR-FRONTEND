import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { User } from 'src/app/models/UserDto';
import { AuthService } from 'src/app/services/auth.service';
import { Catalog } from 'src/app/utils/catalog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true;
  loginForm: FormGroup;
  redirect: string | null = null;
  userLogged: User | null = null;

  constructor(
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    localStorage.setItem('section', 'login');
    this.loginForm = new FormGroup({
      email: new FormControl(null, Validators.required),
      pass: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if (params.has("redirect")) {
        this.redirect = params.get("redirect");
      }
    });
  }

  async login(login: any) {
    if (this.loginForm.invalid) return;
    this.spinner.show();
    try {
      const res = await this.authService.authUser({ password: login.pass, username: login.email }).toPromise();
      if (res.roles.find(item => [Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN].includes(item.idRole))) {
        this.redirect = this.redirect ?? '/admin/users';
        localStorage.setItem("section", "users");
      } else {
        this.redirect = this.redirect ?? '/home';
        localStorage.setItem("section", "home");
      }
      if (this.redirect?.includes('login')) {
        this.redirect = '/home';
        localStorage.setItem("section", "home");
      }

      this.router.navigate([this.redirect]);
    } catch (error: any) {
      console.log(error);
      
      if ([406, 404].includes(error.status)) {
        Swal.fire({
          title: "Credenciales invalidas",
          text: "Por favor, revisa que el usuario y la contraseña sean los correctos.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        })
      } else {
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar comunicarse con el servidor. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        })
      }
      this.redirect = null;
    }
    this.spinner.hide();
  }
}
