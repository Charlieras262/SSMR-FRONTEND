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
  selector: 'app-reviewer-regulatory-framework',
  templateUrl: './reviewer-regulatory-framework.component.html',
  styleUrls: ['./reviewer-regulatory-framework.component.scss']
})
export class ReviewerRegulatoryFrameworkComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  catalog = Catalog;

  created = false;
  userLogged!: UserProfile;
  user?: UserProfile;
  company: any;
  audit: any;
  editFormGroup: FormGroup;
  createFormGroup: FormGroup;
  consultFormGroup: FormGroup;
  regulatory: any;
  roles: any;
  seguirAuditori: Auditoria[] = [];
  inputs: any[] = []; // Array para manejar los valores de los inputs
  dataSource = new MatTableDataSource<UserDetail>();
  displayColumnns: string[] = [
    "#",
    "marcoRegulatorio",
    "empresa",
    "estado",
    "action",
  ];

  selectedFiles: FilesDto[] = [];

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
      empresa: new FormControl(null, Validators.required),
      marcoRegulatorio: new FormControl(null, Validators.required)
    });

    this.editFormGroup = new FormGroup({
      empresa: new FormControl({ value: null, disabled: true }, Validators.required),
      marcoRegulatorio: new FormControl({ value: null, disabled: true }, Validators.required),
      observaciones: new FormControl({ value: null, disabled: false }, Validators.required)
    });

    this.consultFormGroup = new FormGroup({
      empresa: new FormControl({ value: null, disabled: true }, Validators.required),
      marcoRegulatorio: new FormControl({ value: null, disabled: true }, Validators.required),
      observaciones: new FormControl({ value: null, disabled: true }, Validators.required)
    });
  }

  async ngOnInit() {
    try {
      this.getAllAudit();
      this.authService.getUserProfile().toPromise().then(res => {
        this.userLogged = res
        console.log(this.userLogged)
      });
      this.generalService.getData<any[]>(`${environment.api}/internal/regulatory/framework`).toPromise().then(res => this.regulatory = res);
      this.generalService.getData<any[]>(`${environment.api}/internal/company`).toPromise().then(res => this.company = res);
    } catch (error) {
      console.log(error);
    } finally { this.spinner.hide() }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  async getAllAudit() {
    const audit = await this.generalService.getData<any[]>(`${environment.api}/internal/audit`).toPromise();
    console.log(audit)
    this.dataSource.data = audit;
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
      this.audit = await this.authService.getAuditId(item.id).toPromise();
      console.log(this.audit)
      const controls = this.editFormGroup.controls;
      controls.empresa.setValue(this.audit?.auditoriaDetalle.empresa);
      controls.marcoRegulatorio.setValue(this.audit?.auditoriaDetalle.marcoRegulatorio);
      this.audit.marcoRegulatorio.requisitos.map((item: any) => {
        this.inputs.push({ id: item.id, nombre: item.nombre, descripcion: item.descripcion })
      })
      this.modalService.open(content, { centered: true, size: "xl" });
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

  async openConsultModal(content: any, item: any) {
    this.spinner.show();
    try {
      this.audit = await this.authService.getAuditId(item.id).toPromise();
      console.log(this.audit)
      const controls = this.consultFormGroup.controls;
      controls.empresa.setValue(this.audit?.auditoriaDetalle.empresa);
      controls.marcoRegulatorio.setValue(this.audit?.auditoriaDetalle.marcoRegulatorio);
      this.audit.marcoRegulatorio.requisitos.map((item: any) => {
        this.inputs.push({ id: item.id, nombre: item.nombre, descripcion: item.descripcion })
      })
      await this.fullAudit();
      this.modalService.open(content, { centered: true, size: "xl" });
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
  saveAudit(type: number) {
    this.spinner.show();
    if (type == 1) {
      this.authService.createAudit({
        empresa: this.createFormGroup.value.empresa,
        marcoRegulatorio: this.createFormGroup.value.marcoRegulatorio,
      }).toPromise().then(res => {
        Swal.fire({
          title: "Auditoria creada con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.inputs = []
        this.selectedFiles = [];
        this.seguirAuditori = [];
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.getAllAudit();
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

    if (type == 2) {
      this.authService.updateAudit(this.seguirAuditori, this.audit.auditoriaDetalle.id).toPromise().then(_ => {
        Swal.fire({
          title: "Auditoria actualizada con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.inputs = []
        this.seguirAuditori = [];
        this.selectedFiles = [];
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.user = undefined;
        this.getAllAudit();

      }).catch((error) => {
        console.log(error);
        this.user = undefined;

        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar actualizar la auditoria. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      }).finally(() => this.spinner.hide());
    }




    if (type == 3) {
      this.authService.finishAudit(this.editFormGroup.value.observaciones, this.audit.auditoriaDetalle.id).toPromise().then(res => {
        Swal.fire({
          title: "Auditoria Finalizada con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.inputs = []
        this.selectedFiles = [];
        this.seguirAuditori = [];
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.getAllAudit();
      }).catch((error) => {
        console.log(error);
        if (error.status == 400) {
          Swal.fire({
            title: "¡Error!",
            text: "No se han registrado todos los resultados de los requisitos",
            icon: 'error',
            confirmButtonColor: '#2b317f'
          });
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "Lo sentimos, ocurrio un error al intentar guardar los cambios. Por favor, intenta de nuevo más tarde.",
            icon: 'error',
            confirmButtonColor: '#2b317f'
          });
        }
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


  onFileSelected(event: Event, index?: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowedMimeTypes.includes(input.files[0].type)) {
        Swal.fire({
          icon: 'info',
          title: 'Archivo no permitido',
          text: 'Por favor, selecciona un archivo PDF, PNG o JPG.',
        });
        return;
      }
      const file = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        if (this.selectedFiles[index] == undefined) {
          this.selectedFiles.push({
            name: file.name,
            base64: base64String
          })
        } else {
          this.selectedFiles[index].name = file.name
          this.selectedFiles[index].base64 = base64String
        }

        if (this.seguirAuditori[index] == undefined) {
          this.seguirAuditori.push({
            respaldo: base64String
          })
        } else {
          this.seguirAuditori[index].respaldo = base64String
        }
      };
      // Puedes hacer algo con el archivo aquí, como mostrar un nombre o subirlo a un servidor
      console.log('Archivo seleccionado:', this.seguirAuditori);
    }
  }

  onInputChangeState(index: number, value: any): void {
    console.log(value)
    if (this.selectedFiles[index] == undefined) {
      this.seguirAuditori.push({
        resultado: Number(value.value),
        requisito: this.inputs[index].id
      })

    } else {
      this.seguirAuditori[index].resultado = Number(value.value);
      this.seguirAuditori[index].requisito = this.inputs[index].id;
    }
    console.log('Archivo seleccionado:', this.seguirAuditori);
  }


  async fullAudit() {
    this.audit.marcoRegulatorio.requisitos.forEach((res: any) => {
      if (res.estado != null) {
        this.seguirAuditori.push({
          resultado: res.estado,
          requisito: res.id,
          respaldo: res.respaldo
        })
        this.selectedFiles.push({
          name: "Archivo cargado",
          base64: res.respaldo
        })
      }
    })
  }

  async downloadAudit() {
    this.consultFormGroup.reset();

  }
}

export interface FilesDto {
  requisito?: number;
  estado?: number;
  name?: string;
  base64?: string;
}

export interface Auditoria {
  requisito?: number;
  respaldo?: string;
  resultado?: number
}