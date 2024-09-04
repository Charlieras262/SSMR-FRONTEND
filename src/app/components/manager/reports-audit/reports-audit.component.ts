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
  selector: 'app-reports-audit',
  templateUrl: './reports-audit.component.html',
  styleUrls: ['./reports-audit.component.scss']
})
export class ReportsAuditComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  catalog = Catalog;
  documentSupport: any = [];
  created = false;
  userLogged!: UserProfile;
  user?: UserProfile;
  company: any;
  audit: any;
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
    "nombreAuditor",
    "empresa",
    "representante",
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
    const audit = await this.authService.getAuditCompanyAdmin().toPromise();
    console.log(audit)
    this.dataSource.data = audit;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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

  async openConsultSupport(content: any, item: any) {
    this.spinner.show();
    this.documentSupport = [];
    try {
      this.documentSupport.push({ base64: this.audit.marcoRegulatorio.requisitos[item].respaldo })
      this.modalService.open(content, { centered: true, size: "xl" });
      this.mostrarVisor = true;
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "¡Error!",
        text: "Lo sentimos, ocurrio un error al intentar cambiar la contraseña. Por favor, intenta de nuevo más tarde.",
        icon: 'error',
        confirmButtonColor: '#2b317f'
      });
      this.spinner.hide();
    }
  }



  isAdmin() {
    return this.authService.getUserStored()?.roles?.find(role => [Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN].includes(role.idRole)) != null;
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
    this.documentAudit = [];
    const estado12 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    const estado13 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 13).length;
    const estado14 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 14).length;

    this.calcularPorcentajeAceptacion();
    const aceptacion = this.porcentaje;
    const negacion = (100 - this.porcentaje).toFixed(2)

    this.documentAudit.push({
      nombreResolucion: this.audit.auditoriaDetalle.marcoRegulatorio,
      nombreEmpresa: this.audit.auditoriaDetalle.empresa,
      nombreAuditor: this.audit.auditoriaDetalle.nombreAuditor,
      observaciones: this.audit.auditoriaDetalle.observaciones,
      estado12: estado12, estado13: estado13, estado14: estado14, aceptacion: aceptacion, negacion: negacion
    })

    this.audit.marcoRegulatorio.requisitos.forEach((res: any) => {
      this.documentAudit.push({ descripcion: res.nombre, cumple: res.estado == 12, noCumple: res.estado == 13, noAplica: res.estado == 14 })
    })
  }


  async calcularPorcentajeAceptacion() {
    const totalEvaluados = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12 || requisito.estado === 13).length;
    const totalCumple = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    if (totalEvaluados != 0) {
      const porcentajeAceptacion = (totalCumple / totalEvaluados) * 100;
      this.porcentaje = porcentajeAceptacion.toFixed(2)
    } else {
      this.porcentaje = 0;
    }
  }



  async openDocumentModal(content: any) {
    this.spinner.show()
    try {
      await this.downloadAudit();
      this.mostrarVisor = true;
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
  }

  async openGraficaModal(content: any) {
    this.spinner.show()
    try {
      this.modalService.open(content, { centered: true, size: "lg" });
      this.crearBar()
      this.crearPie();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "¡Error!",
        text: "Lo sentimos, ocurrio un error al intentar cambiar la contraseña. Por favor, intenta de nuevo más tarde.",
        icon: 'error',
        confirmButtonColor: '#2b317f'
      });
    }
    this.spinner.hide()
  }



  async crearBar() {
    const estado12 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 12).length;
    const estado13 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 13).length;
    const estado14 = this.audit.marcoRegulatorio.requisitos.filter((requisito: any) => requisito.estado === 14).length;

    const data = {
      labels: ['Cumple', 'No Cumple', 'No Aplica'],

      datasets: [{
        label: 'Artículos Evaluados',
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
    console.log("empieza a crear")
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
  }

  async crearPie() {
    this.calcularPorcentajeAceptacion();
    const aceptacion = this.porcentaje;
    const negacion = (100 - this.porcentaje).toFixed(2)

    const data = {
      labels: ['Aceptación', 'Incumplimiento'],
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
        borderWidth: 1,
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
            position: 'top', // Posición de la leyenda
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