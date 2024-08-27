import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserDetail, UserProfile } from 'src/app/models/UserDto';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { Catalog } from 'src/app/utils/catalog';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  catalog = Catalog;

  created = false;
  userLogged!: UserProfile;
  user?: UserProfile;
  editFormGroup: FormGroup;
  createFormGroup: FormGroup;
  states: any;
  roles: any;
  dataSource = new MatTableDataSource<UserDetail>();
  displayColumnns: string[] = [
    "#",
    "username",
    "name",
    "email",
    "state",
    "action",
  ];

  constructor(
    private authService: AuthService,
    private generalService: GeneralService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    config: NgbModalConfig
  ) {

    this.spinner.show();
    localStorage.setItem("section", "users");

    config.backdrop = 'static';
    config.keyboard = false;
    config.size = 'lg';
    this.createFormGroup = new FormGroup({
      name: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      roles: new FormControl(null, Validators.required),
      username: new FormControl(null),
      pass: new FormControl(null),
      email: new FormControl(null, Validators.required)
    });

    this.editFormGroup = new FormGroup({
      name: new FormControl({ value: null, disabled: true }, Validators.required),
      lastname: new FormControl({ value: null, disabled: true }, Validators.required),
      state: new FormControl(null, Validators.required),
      roles: new FormControl(null, Validators.required),
      email: new FormControl({ value: null, disabled: true }, Validators.required),
      delete: new FormControl(false)
    });
  }

  async ngOnInit() {
    try {
      this.getAllUsers();
      this.generalService.getData(`${environment.api}/external/catalogue/getBy/1`).toPromise().then(res => this.states = res);
      this.generalService.getData(`${environment.api}/external/catalogue/getBy/2`).toPromise().then(res => this.roles = res);
      this.authService.getUserProfile().toPromise().then(res => this.userLogged = res);
    } catch (error) {
      console.log(error);
    }
    this.spinner.hide();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  async getAllUsers() {
    const users = await this.authService.getUsers().toPromise();
    this.dataSource.data = users;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateModal(content: any) {
    console.log(content);

    this.modalService.open(content, { centered: true });
  }

  async openEditModal(content: any, item: UserDetail) {
    this.spinner.show();
    try {
      this.user = await this.authService.getUserProfile(item.username).toPromise();
      const controls = this.editFormGroup.controls;
      controls.name.setValue(this.user?.name);
      controls.lastname.setValue(this.user?.lastName);
      controls.state.setValue(this.user?.state);
      controls.email.setValue(this.user?.email);
      controls.roles.setValue(this.roles.filter((role: any) => this.user?.roles.map(item => item.idRole).includes(role.idCatalogueChild)));

      this.modalService.open(content, { centered: true });
    } catch (error) {
      console.error(error);
      
      Swal.fire({
        title: "¡Error!",
        text: "Lo sentimos, ocurrio un error al intentar cambiar la contraseña. Por favor, intenta de nuevo más tarde.",
        icon: 'error',
        confirmButtonColor: '#2b317f'
      });
    }
    this.spinner.hide();
  }

  saveUser(type: number) {
    this.spinner.show();
    if (this.editFormGroup.value.delete) {
      this.authService.deleteUser(this.user!.username).subscribe((res) => {
        this.spinner.hide();
        if (res) {
          Swal.fire({
            title: "¡Eliminado!",
            text: "El usuario ha sido eliminado correctamente.",
            icon: 'success',
            confirmButtonColor: '#2b317f'
          });
          this.modalService.dismissAll();
          this.editFormGroup.reset();
          this.user = undefined;
          this.getAllUsers();
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "Lo sentimos, ocurrio un error al intentar eliminar el usuario. Por favor, intenta de nuevo más tarde.",
            icon: 'error',
            confirmButtonColor: '#2b317f'
          });
        }
      }, (_) => {
        this.spinner.hide();
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar eliminar el usuario. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      });
      return;
    }
    if (type == 1) {
      this.authService.updateUser({
        state: this.editFormGroup.value.state,
        roles: this.editFormGroup.value.roles.map((item: any) => item.idCatalogueChild)
      }, this.user?.username ?? '').toPromise().then(_ => {
        Swal.fire({
          title: "Usuario actualizado con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.user = undefined;
        this.getAllUsers();

      }).catch((error) => {
        console.log(error);
        this.user = undefined;

        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar crear al usuario. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      }).finally(() => this.spinner.hide());
    } else {
      this.authService.createUser({
        name: this.createFormGroup.value.name,
        lastName: this.createFormGroup.value.lastname,
        roles: this.createFormGroup.value.roles.map((item: any) => item.idCatalogueChild),
        email: this.createFormGroup.value.email,
        state: this.createFormGroup.value.state
      }).toPromise().then(res => {
        Swal.fire({
          title: "Usuario creado con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.created = true;
        this.createFormGroup.controls.username.setValue(res.username);
        this.createFormGroup.controls.pass.setValue(res.password);

        this.createFormGroup.disable();

        this.createFormGroup.controls.username.enable();
        this.createFormGroup.controls.pass.enable();

        this.getAllUsers();
      }).catch((error) => {
        console.log(error);

        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar guardar los cambios. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      }).finally(() => this.spinner.hide());
    }
  }

  validateDeletion() {
    const deleteControl = this.editFormGroup.controls.delete;
    if (deleteControl.value) {
      deleteControl.setValue(false);
      Swal.fire({
        title: '¿Estás seguro?',
        html: `<p class="text-justify" style="font-size: 15px">Seleccionar esta opción significa que <b>eliminarás permanentemente</b> la información del usuario <b>${this.user?.username}</b>. De igual manera se <b>revocarán</b> cualquier tipo acceso al sistema y bandeja de correo electrónico.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2b317f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        deleteControl.setValue(result.value);
      }
      );
    }
  }

  isAdmin() {
    return this.authService.getUserStored()?.roles?.find(role => [Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN].includes(role.idRole)) != null;
  }
}
