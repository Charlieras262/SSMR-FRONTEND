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
  selector: 'app-manager-regulatory-framework',
  templateUrl: './manager-regulatory-framework.component.html',
  styleUrls: ['./manager-regulatory-framework.component.scss']
})
export class ManagerRegulatoryFrameworkComponent implements OnInit {


  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  catalog = Catalog;

  selectedFiles: FilesDto[] = [];
  created = false;
  userLogged!: UserProfile;
  user?: UserProfile;
  regulatory: any;
  editFormGroup: FormGroup;
  createFormGroup: FormGroup;
  states: any;
  roles: any;
  dataSource = new MatTableDataSource<UserDetail>();
  inputs: string[] = []; // Array para manejar los valores de los inputs
  displayColumnns: string[] = [
    "#",
    "nombre",
    "descripcion",
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
      descripcion: new FormControl(null, Validators.required)
    });

    this.editFormGroup = new FormGroup({
      nombre: new FormControl({ value: null, disabled: true }, Validators.required),
      descripcion: new FormControl({ value: null, disabled: false }, Validators.required),
    });
  }

  async ngOnInit() {
    try {
      this.getAllRegulatory();
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


  async getAllRegulatory() {
    const regulatory = await this.generalService.getData<any[]>(`${environment.api}/internal/regulatory/framework`).toPromise();
    this.dataSource.data = regulatory;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openCreateModal(content: any) {
    console.log(content);
    this.modalService.open(content, { centered: true });
    this.inputs = []
  }

  async openEditModal(content: any, item: any) {
    this.spinner.show();
    try {
      this.regulatory = await this.authService.getRegulatoryId(item.id).toPromise();
      console.log(this.regulatory)
      const controls = this.editFormGroup.controls;
      controls.nombre.setValue(this.regulatory?.nombre);
      controls.descripcion.setValue(this.regulatory?.descripcion);
      this.regulatory.requisitos.map((item: any) => {
        this.inputs.push(item.descripcion)
      })
      console.log(this.inputs)
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

  saveRegulatory(type: number) {
    this.spinner.show();
    let numero = 0
    let req = [{
      descripcion: "",
      nombre: "",
      id: 0
    }];
    if (this.editFormGroup.value.delete) {
      this.authService.deleteUser(this.user!.username).subscribe((res) => {
        this.spinner.hide();
        if (res) {
          Swal.fire({
            title: "¡Eliminado!",
            text: "El marco regulatorio ha sido eliminado correctamente.",
            icon: 'success',
            confirmButtonColor: '#2b317f'
          });
          this.modalService.dismissAll();
          this.editFormGroup.reset();
          this.user = undefined;
          this.getAllRegulatory();
        } else {
          Swal.fire({
            title: "¡Error!",
            text: "Lo sentimos, ocurrio un error al intentar eliminar el marco regulatorio. Por favor, intenta de nuevo más tarde.",
            icon: 'error',
            confirmButtonColor: '#2b317f'
          });
        }
      }, (_) => {
        this.spinner.hide();
        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar eliminar el marco regulatorio. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      });
      return;
    }
    if (type == 1) {

      req.splice(0, 1)
      this.inputs.map((items: any) => {
        req.push({
          id: this.regulatory.requisitos[numero].id,
          descripcion: items,
          nombre: "Articulo " + (numero += 1).toString()
        })
      });
      this.authService.updateRegulatory({
        nombre: this.editFormGroup.get("nombre")?.value,
        descripcion: this.editFormGroup.value.descripcion,
        documento: "",
        requisitos: req,
      }, this.regulatory.id).toPromise().then(_ => {
        Swal.fire({
          title: "Marco  actualizado con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.inputs = []
        this.selectedFiles = []
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.user = undefined;
        this.getAllRegulatory();

      }).catch((error) => {
        console.log(error);
        this.user = undefined;

        Swal.fire({
          title: "¡Error!",
          text: "Lo sentimos, ocurrio un error al intentar crear el marco regulatorio. Por favor, intenta de nuevo más tarde.",
          icon: 'error',
          confirmButtonColor: '#2b317f'
        });
      }).finally(() => this.spinner.hide());
    } else {
      req.splice(0, 1)
      this.inputs.map((items: any) => {
        req.push({
          descripcion: items,
          nombre: "Articulo " + (numero += 1).toString(),
          id: 0
        })
      });
      this.authService.createRegulatory({
        nombre: this.createFormGroup.value.nombre,
        descripcion: this.createFormGroup.value.descripcion,
        documento: this.selectedFiles[0].base64,
        requisitos: req,
      }).toPromise().then(res => {
        Swal.fire({
          title: "Marco Regulatorio creado con éxito",
          icon: 'success',
          confirmButtonColor: '#2b317f'
        });
        this.inputs = []
        this.selectedFiles = []
        this.modalService.dismissAll();
        this.editFormGroup.reset();
        this.getAllRegulatory();
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


  addInput(): void {
    this.inputs.push(''); // Agrega un nuevo input vacío al array
  }

  // Método para manejar el cambio en los inputs (opcional)
  onInputChange(index: number, value: any): void {
    this.inputs[index] = value.target.value;
    console.log(this.inputs)
  }

  isFormValid(): boolean {
    return this.inputs.every(input => input.trim() !== '');
  }



  onFileSelected(event: Event) {
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
        this.selectedFiles.push({
          name: file.name,
          base64: base64String
        });
      };
      console.log('Archivo Files:', this.selectedFiles);
    }
  }


}


export interface FilesDto {
  name: string;
  base64: string;
}
