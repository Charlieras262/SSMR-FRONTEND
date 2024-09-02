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
  selector: 'app-business-catalog',
  templateUrl: './business-catalog.component.html',
  styleUrls: ['./business-catalog.component.scss']
})
export class BusinessCatalogComponent implements OnInit {


  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  catalog = Catalog;

  created = false;
  userLogged!: UserProfile;
  user?: UserProfile;
  company: any;
  editFormGroup: FormGroup;
  createFormGroup: FormGroup;
  agent: any;
  roles: any;
  dataSource = new MatTableDataSource<UserDetail>();
  displayColumnns: string[] = [
    "#",
    "nombre",
    "descripcion",
    "representante",
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
      nombre: new FormControl(null, Validators.required),
      descripcion: new FormControl(null, Validators.required),
      representante: new FormControl(null, Validators.required)
    });

    this.editFormGroup = new FormGroup({
      nombre: new FormControl({ value: null, disabled: true }, Validators.required),
      descripcion: new FormControl({ value: null, disabled: false }, Validators.required),
      representante: new FormControl(null, Validators.required)
    });
  }

  async ngOnInit() {
    try {
      this.getAllCompany();
      this.authService.getUserProfile().toPromise().then(res => this.userLogged = res);
      this.authService.getUsersCompanies().toPromise().then(res => this.agent = res);
      console.log(this.agent)
    } catch (error) {
      console.log(error);
    } finally {
      this.spinner.hide();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  async getAllCompany() {
    const company = await this.generalService.getData<any[]>(`${environment.api}/internal/company`).toPromise();
    this.dataSource.data = company;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateModal(content: any) {
    console.log(content);
    this.modalService.open(content, { centered: true });
  }

  async openEditModal(content: any, item: any) {
    this.spinner.show();
    try {
      this.company = await this.authService.getCompanyId(item.id).toPromise();
      console.log(this.company)
      const controls = this.editFormGroup.controls;
      controls.nombre.setValue(this.company?.nombre);
      controls.descripcion.setValue(this.company?.descripcion);
      controls.representante.setValue(this.company?.idRepresentante);
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

  saveCompany(type: number) {
    this.spinner.show();
    if (this.editFormGroup.value.delete) {
      this.authService.deleteUser(this.user!.username).subscribe((res) => {
        this.spinner.hide();
        if (res) {
          Swal.fire({
            title: "¡Eliminado!",
            text: "La empresa ha sido eliminado correctamente.",
            icon: 'success',
            confirmButtonColor: '#2b317f'
          });
          this.modalService.dismissAll();
          this.editFormGroup.reset();
          this.user = undefined;
          this.getAllCompany();
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "Lo sentimos, ocurrio un error al intentar eliminar la empresa. Por favor, intenta de nuevo más tarde.",
            icon: 'error',
            confirmButtonColor: '#2b317f'
          });
        }
      }, (_) => {
        this.spinner.hide();
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar eliminar la empresa. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      });
      return;
    }
    if (type == 1) {
      this.authService.updateCompany({
        nombre: this.editFormGroup.get("nombre")?.value,
        descripcion: this.editFormGroup.value.descripcion,
        representante: this.editFormGroup.value.representante,
      }, this.company.id).toPromise().then(_ => {
        Swal.fire({
          title: "Empresa actualizada con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.user = undefined;
        this.getAllCompany();

      }).catch((error) => {
        console.log(error);
        this.user = undefined;

        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar actualizar la empresa. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      }).finally(() => this.spinner.hide());
    } else {
      this.authService.createCompany({
        nombre: this.createFormGroup.value.nombre,
        descripcion: this.createFormGroup.value.descripcion,
        representante: this.createFormGroup.value.representante,
      }).toPromise().then(res => {
        Swal.fire({
          title: "Empresa creada con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.getAllCompany();
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
