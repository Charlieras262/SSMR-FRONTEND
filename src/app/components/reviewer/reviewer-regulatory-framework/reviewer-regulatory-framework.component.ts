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
import { Chart, ChartType } from 'chart.js/auto';

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
  mostrarVisor = false;
  porcentaje: any;
  documentAudit: any = [];
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

  public chart!: Chart;
  public chartBar!: Chart;
  public chartPie!: Chart;
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
      await this.authService.getUserProfile().toPromise().then(res => {
        this.userLogged = res
        console.log(this.userLogged)
      });
      await this.getAllAudit();
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
    const audit = await this.authService.getAuditUser().toPromise();
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
      // this.selectedFiles = Array.from({ length: this.audit.marcoRegulatorio.requisitos.length }, () => new FilesDto);

      this.selectedFiles = Array.from({ length: this.audit.marcoRegulatorio.requisitos.length }, (): FilesDto => ({
        requisito: 0, // o cualquier valor predeterminado que desees
        estado: 0,
        name: '',
        base64: ''
      }));


      this.seguirAuditori = Array.from({ length: this.audit.marcoRegulatorio.requisitos.length }, (): Auditoria => ({
        requisito: 0, // o cualquier valor predeterminado que desees
        respaldo: '',
        resultado: 0
      }));

      await this.fullAuditEdit();

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
      controls.observaciones.setValue(this.audit.auditoriaDetalle.observaciones)
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
        auditor: this.userLogged.username
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
      this.seguirAuditori = this.seguirAuditori.filter(item => item.requisito !== 0);

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
          this.selectedFiles.splice(index, 0, {
            name: file.name,
            base64: base64String
          })
        } else {
          this.selectedFiles[index].name = file.name
          this.selectedFiles[index].base64 = base64String
        }

        if (this.seguirAuditori[index] == undefined) {
          this.seguirAuditori.splice(index, 0, {
            respaldo: base64String
          })
        } else {
          this.seguirAuditori[index].respaldo = base64String
        }
      };
    }
  }

  onInputChangeState(index: number, value: any): void {
    if (this.selectedFiles[index] == undefined) {
      this.seguirAuditori.splice(index, 0, {
        resultado: Number(value.value),
        requisito: this.inputs[index].id
      })
    } else {
      this.seguirAuditori[index].resultado = Number(value.value);
      this.seguirAuditori[index].requisito = this.inputs[index].id;
    }
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

  async fullAuditEdit() {
    this.audit.marcoRegulatorio.requisitos.forEach((res: any, index: any) => {
      if (res.estado != null) {

        this.seguirAuditori[index] = {
          resultado: res.estado,
          requisito: res.id,
          respaldo: res.respaldo
        }

        this.selectedFiles[index] = {
          name: res.respaldo != "" ? "Archivo cargado" :  "",
          base64: res.respaldo
        }
      }
      console.log(this.selectedFiles)
    })
  }

  async crearBar() {
    const estado12 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    const estado13 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 13).length;
    const estado14 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 14).length;
    const data = {
      labels: ['Cumple', 'No Cumple', 'No Aplica'],
      datasets: [{
        label: 'Categorías',
        data: [estado12, estado13, estado14],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
        ],
        borderWidth: 1
      }]
    };

    // Creamos la gráfica
    this.chartBar = new Chart("chartBar", {
      type: 'bar' as ChartType, // tipo de la gráfica 
      data: data, // datos 
      options: { // opciones de la gráfica 
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true, // Muestra la leyenda
            position: 'top' // Posición de la leyenda
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw || '';
                return `${label}: ${value}`;
              }
            }
          }
        }
      },
    });
    const chartImage = this.chartBar.toBase64Image();
  }

  async crearPie() {
    this.calcularPorcentajeAceptacion();
    const aceptacion = this.porcentaje;
    const negacion = (100 - this.porcentaje).toFixed(2)
    const data = {
      labels: ['Aceptación', 'No cumple'],
      datasets: [{
        label: 'Categorías',
        data: [aceptacion, negacion],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
        ],
        borderWidth: 1
      }]
    };

    // Creamos la gráfica
    this.chartPie = new Chart("chartPie", {
      type: 'pie' as ChartType, // tipo de la gráfica 
      data: data, // datos 
      options: { // opciones de la gráfica 
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true, // Muestra la leyenda
            position: 'top' // Posición de la leyenda
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const label = tooltipItem.label || '';
                const value = tooltipItem.raw || '';
                return `${label}: ${value}`;
              }
            }
          }
        }
      },
    });
    const chartImage = this.chartPie.toBase64Image();
  }


  async downloadAudit() {
    this.documentAudit = [];
    this.spinner.show()

    const estado12 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    const estado13 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 13).length;
    const estado14 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 14).length;

    this.calcularPorcentajeAceptacion();
    console.log(this.porcentaje)
    const aceptacion = this.porcentaje;
    const negacion = (100 - this.porcentaje).toFixed(2)


    this.documentAudit.push({
      nombreResolucion: this.audit.auditoriaDetalle.marcoRegulatorio,
      nombreEmpresa: this.audit.auditoriaDetalle.empresa,
      nombreAuditor: this.audit.auditoriaDetalle.nombreAuditor,
      observaciones: this.audit.auditoriaDetalle.observaciones == "" ? this.editFormGroup.value.observaciones : this.audit.auditoriaDetalle.observaciones,
      estado12: estado12, estado13: estado13, estado14: estado14, aceptacion: aceptacion, negacion: negacion
    })

    this.audit.marcoRegulatorio.requisitos.forEach((res: any) => {
      this.documentAudit.push({ descripcion: res.nombre, cumple: res.estado == 12, noCumple: res.estado == 13, noAplica: res.estado == 14 })
    })
    this.spinner.hide()
  }


  calcularPorcentajeAceptacion() {
    const totalEvaluados = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12 || requisito.estado === 13).length;
    const totalCumple = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    if (totalEvaluados != 0) {
      const porcentajeAceptacion = (totalCumple / totalEvaluados) * 100;
      this.porcentaje = porcentajeAceptacion.toFixed(2)
    } else {
      this.porcentaje = 0;
    }
    console.log(`Porcentaje de aceptación: ${this.porcentaje}% `);
  }



  async openDocumentModal(content: any) {
    this.spinner.show()
    // await this.crearBar();
    //await this.crearPie();
    await this.downloadAudit();
    this.mostrarVisor = true;
    this.modalService.open(content, { centered: true, size: "xl" });
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