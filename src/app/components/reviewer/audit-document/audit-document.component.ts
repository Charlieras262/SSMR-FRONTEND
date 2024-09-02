import { Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartType } from 'chart.js/auto';
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
declare let $: any;

@Component({
  selector: 'app-audit-document',
  templateUrl: './audit-document.component.html',
  styleUrls: ['./audit-document.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class AuditDocumentComponent implements OnInit {

  @Input('documentAudit') documentAudit!: any;
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;
  mostrarPdf: boolean = false;
  mostrarImg: boolean = false;
  mostrarMensajeError: boolean = false;
  docBase64: any;
  docDefinition: any;
  docBase642: any;
  formattedDate: string;
  generado = false;
  public chartBar!: Chart;
  public chartPie!: Chart;
  porcentaje: any;
  constructor(
    private _sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private http: HttpClient
  ) {
    const today = new Date();
    this.formattedDate = this.formatDate(today);
  }

  async ngOnInit() {
    this.spinner.show();

    await this.crearBar();
    await this.crearPie();
    // await this.crearBar();
    //await this.crearPie();
    setTimeout(async () => {
      await this.makePDF();
    }, 5000);

    this.spinner.hide();
  }


  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `Guatemala, ${new Intl.DateTimeFormat('es-ES', options).format(date)}`;
  }

  public async makePDF() {

    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const footerContent = (currentPage: any, pageCount: any) => {
      return {
        columns: [
          {
            stack: [
              { text: `Auditoria ${this.documentAudit[0].nombreResolucion}`, alignment: 'right', style: 'text' },
              { text: this.documentAudit[0].nombreEmpresa, alignment: 'right', style: 'text' },
              { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', style: 'text' }
            ],
            margin: [0, 0, 70, 0] // Margen solo para el stack
          }
        ],
      };
    };

    const dd = {
      pageSize: 'letter',
      pageOrientation: 'portrait',
      pageMargins: [70, 90, 70, 70],
      header: {
        image: await this.getBase64ImageFromURL("assets/img/Logo audit.png"),
        fit: [150, 150],
        alignment: 'left',
        margin: [20, 20, 20, 20]
      },
      content: [

        { text: '\n', },
        {
          text: 'Informe Final de Auditoría del Marco Regulatorio',
          style: 'jobTitle',
        },
        { text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', },
        {
          text: this.documentAudit[0].nombreEmpresa,
          style: 'subTitle',
        },
        { text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n', },
        {
          text: 'Auditado por: ',
          style: 'subTitle2',
        },
        { text: '\n', },
        {
          text: `Auditor ${this.documentAudit[0].nombreAuditor}`,
          style: 'subTitle3',
        },
        { text: '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n', },

        {
          text: this.formattedDate,
          style: 'subTitle3',
        },
        { text: '\n\n\n', },
        {
          text: 'Este informe presenta los resultados de la auditoría '
            + 'realizada sobre el cumplimiento del marco legal '
            + this.documentAudit[0].nombreResolucion + ' en ' + this.documentAudit[0].nombreEmpresa + '.'
            + ' La auditoría se llevó a cabo con el fin de evaluar el nivel de conformidad de los artículos específicos de la normativa, proporcionando un análisis detallado de las áreas en cumplimiento, áreas de no conformidad, y artículos no aplicables.',
          style: 'text',
        },
        { text: '\n\n\n\n', },
        this.table(this.documentAudit, ['descripcion', 'cumple', 'noCumple', 'noAplica']),
        { text: '\n', }, // Salto de línea después de la primera tabla
        { text: '\n', }, // Salto de línea después de la primera tabla
        { text: '\n', }, // Salto de línea después de la primera tabla

        {
          text: "Resultados y Análisis",
          style: 'subtitulo',
          pageBreak: 'before',
        },
        {
          text: this.documentAudit[0].observaciones,
          style: 'text',
        },
        { text: '\n\n', }, // Salto de línea después de la primera tabla
        {
          text: "Análisis de la Auditoria",
          style: 'subtitulo',
        },
        {
          text: "La gráfica presentada a continuación ilustra"
            + " la distribución cuantitativa de los artículos evaluados bajo el marco regulatorio "
            + this.documentAudit[0].nombreResolucion + ". Como se puede observar, se destacan los"
            + " artículos que cumplen con los requisitos establecidos, aquellos que no cumplen y los que no son aplicables. Este análisis es fundamental para identificar las áreas donde la organización se encuentra en conformidad con la normativa y aquellas que requieren atención y mejora",
          style: 'text',
        },
        { text: '\n', }, // Salto de línea después de la primera tabla
        {
          text: "Resultados",
          style: 'subtitulo',
        },
        {
          text: ' -Total de "Cumple": ' + this.documentAudit[0].estado12 + " Artículos.",
          style: 'text',
        },
        {
          text: ' -Total de "No Cumple": ' + this.documentAudit[0].estado13 + " Artículos.",
          style: 'text',
        },
        {
          text: ' -Total de "No Aplica": ' + this.documentAudit[0].estado14 + " Artículos.",
          style: 'text',
        },
        {
          image: await this.chartBar.toBase64Image(),
          width: 400,
          alignment: 'left',
          margin: [20, 20, 20, 20]
        },
        {
          text: "Análisis del Marco Regulatorio",
          style: 'subtitulo',
          pageBreak: 'before',
        },
        {
          text: "La gráfica siguiente, se presenta el porcentaje de cumplimiento del marco regulatorio " +
            this.documentAudit[0].nombreResolucion + " en la organización. " +
            "Este porcentaje se calcula considerando únicamente los artículos que son aplicables y que han sido evaluados como 'cumple' o 'no cumple'. Este indicador es crucial para evaluar el nivel de conformidad general de la empresa con respecto a las normativas vigentes, proporcionando una visión clara del cumplimiento regulatorio alcanzado.",
          style: 'text',
        },
        { text: '\n', }, // Salto de línea después de la primera tabla
        {
          text: "Resultados",
          style: 'subtitulo',
        },
        {
          text: ' -Porcentaje de "Aceptación": ' + this.documentAudit[0].aceptacion + "%.",
          style: 'text',
        },
        {
          text: ' -Porcentaje de "Incumplimiento": ' + this.documentAudit[0].negacion + "%.",
          style: 'text',
        },
        {
          image: await this.chartPie.toBase64Image(),
          width: 300,
          alignment: 'left',
          margin: [20, 20, 20, 20]
        },
      ],
      defaultStyle: {
        fontSize: 5,
        alignment: 'center'
      },
      footer: footerContent,
      styles: {
        headerTable: {
          color: 'black',
          alignment: 'center',
          fontSize: 9,
          arial: true,
          bold: true
        },
        subtitulo: {
          color: 'black',
          alignment: 'justify',
          fontSize: 14,
          bold: true,
          arial: true,
        },
        text: {
          color: 'black',
          alignment: 'justify',
          fontSize: 12,
          arial: true,
        },
        jobTitle: {
          fontSize: 40,
          bold: 'true',
          alignment: 'center',
          arial: true,
        },
        subTitle: {
          fontSize: 20,
          bold: 'true',
          alignment: 'center',
          arial: true,
        },
        subTitle2: {
          fontSize: 14,
          bold: 'true',
          alignment: 'center',
          arial: true,
        },
        subTitle3: {
          fontSize: 12,
          bold: 'true',
          alignment: 'center',
          arial: true,
        }
      }
    }
    const pdfBlob: Blob = await new Promise(resolve => {
      pdfMake.createPdf(dd).getBlob((blob: Blob) => {
        resolve(blob);
      });
    });

    this.documentBlob = pdfBlob
    await this.renderDoc(pdfBlob);
  }
  documentBlob: any



  public async renderDoc(doc: Blob) {
    const reader = new FileReader();
    reader.readAsDataURL(doc);
    reader.onloadend = () => {
      this.docBase64 = reader.result;
      const arrayTipo = doc.type.split('/');
      if (arrayTipo[1] == 'pdf') {
        this.mostrarPdf = true;
      }
      else if (arrayTipo[0] == 'image') {
        this.mostrarImg = true;
      } else {
        this.mostrarMensajeError = true;
      }
    }
  }

  buildTableBody(data: any, columns: any) {
    console.log(data)
    var body = [];
    body.push(
      [
        {
          text: `MARCO REGULATORIO ${this.documentAudit[0].nombreResolucion}`,
          style: 'headerTable',
          colSpan: 4,
          alignment: 'center'
        }, {}, {}, {}
      ],
      [
        { text: 'DESCRIPCIÓN', style: 'headerTable' },
        { text: 'CUMPLE', style: 'headerTable' },
        { text: 'NO CUMPLE', style: 'headerTable' },
        { text: 'NO APLICA', style: 'headerTable' }]);
    data.forEach((element: any) => {
      console.log(element)
      var dataRow: any = [];
      if (element.descripcion != undefined) {
        columns.forEach((element2: any) => {
          if (element[element2] == true || element[element2] == false) {
            dataRow.push(
              [{ text: element[element2] == true ? 'X' : '', style: 'headerTable' }])
          } else {
            dataRow.push(
              [{ text: element[element2], style: 'headerTable' }])
          }
        });
        body.push(dataRow);
      }
    });
    return body;
  }

  table(data: any, columns: any) {
    return {
      table: {
        widths: [250, '*', '*', '*'],
        headerRows: 1,
        body: this.buildTableBody(data, columns)
      }
    };
  }


  getBase64ImageFromURL(url: any) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  async crearBar() {
    const data = {
      labels: ['Cumple', 'No Cumple', 'No Aplica'],
      datasets: [{
        label: 'Categorías',
        data: [this.documentAudit[0].estado12, this.documentAudit[0].estado13, this.documentAudit[0].estado14],
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
  }

  async crearPie() {
    const data = {
      labels: ['Aceptación', 'Incumplimiento'],
      datasets: [{
        label: 'Categorías',
        data: [this.documentAudit[0].aceptacion, this.documentAudit[0].negacion],
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
  }



}
