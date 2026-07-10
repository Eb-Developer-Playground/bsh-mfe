import { Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { default as populateOptions } from '../../../../../assets/data/populate-dropdown.json';
import { ContextManager } from '../../stepper';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-edd-form-print',
  templateUrl: './edd-form-print.component.html',
  styleUrls: ['./edd-form-print.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class EddFormPrintComponent implements OnInit {
  @ViewChild('printPdfWrap') pdfTable: ElementRef | undefined;
  @Input() eddDetails!: any;
  occupation: any;
  personalDetails: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private ctxManager: ContextManager
  ) {}

  ngOnInit(): void {
    const a = (populateOptions.responseObject as Record<string, unknown>)['occupation'];
    const b = this.ctxManager.currentContextData.signatoryCIF;
    this.personalDetails = {
      name:
        b.personalDetails?.lastName +
        ' ' +
        b.PersonalDetails?.middleName +
        ' ' +
        b.PersonalDetails?.firstName,
      cif: b.personalDetails.customerId,
    };
    this.occupation = this.data.occupation;
  }

  downloadAsPDF() {
    const data = document.getElementById('printPdfWrap');
    html2canvas(data as any).then(
      (canvas: {
        height: number;
        width: number;
        toDataURL: (arg0: string) => any;
      }) => {
        const imgWidth = 210;
        const pageHeight = 290;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const heightLeft = imgHeight;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdfData = new jsPDF('p', 'mm', 'a4', true);
        const position = 0;
        pdfData.addImage(
          contentDataURL,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        ); //preferred imgHeight: 290
        // retrieve pdf as base64
        const ul = pdfData.output('datauristring');
        const pdf_Data = ul.replace(
          'data:application/pdf;filename=generated.pdf;base64,',
          ''
        );

        this.dialogRef.close({ pdf_Data });
      }
    );
  }

  onSubmit() {
    this.downloadAsPDF();
  }
}
