import { Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
declare let $: any;

@Component({
  selector: 'app-document-supporting',
  templateUrl: './document-supporting.component.html',
  styleUrls: ['./document-supporting.component.scss']
})

@Injectable({
  providedIn: 'root'
})
export class DocumentSupportingComponent implements OnInit {

  @Input('documentSupport') documentSupport!: any;
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;
  mostrarPdf: boolean = false;
  mostrarImg: boolean = false;
  mostrarMensajeError: boolean = false;
  docBase64: any;
  generado = false;
  constructor(
    private spinner: NgxSpinnerService,
  ) {
  }

  async ngOnInit() {
    this.spinner.show();
    await this.renderDoc();
  }


  public async renderDoc() {
    this.spinner.show();
    this.docBase64 = this.documentSupport[0].base64
    if (this.getMimeTypeFromBase64(this.docBase64) == "application/pdf") {
      this.mostrarPdf = true;
      this.mostrarImg = false;
    } else {
      this.mostrarPdf = false;
      this.mostrarImg = true;
    }

    this.spinner.hide();
  }


  getMimeTypeFromBase64(base64: string): string {
    const match = base64.match(/^data:([a-zA-Z0-9+/=.-]+);base64,/);
    return match ? match[1] : 'unknown';
  }
}
