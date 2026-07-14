import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CardSectionComponent } from '@app/home/customer/card-issuance/components/card-section/card-section.component';

@Component({
  templateUrl: './card-print-page.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-print-page.component.scss',
  ],
  imports: [
    NgIf,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    CardSectionComponent,
  ],
})
export class CardPrintPageComponent {
  showNotice = true;
  triggerPrint() {
    this.triggerPrintJob({
      AccountName: 'John Doe',
      AccountNumber: '1234567890',
    });
  }

  constructor(private http: HttpClient) {}

  checkPrinterError() {}
  triggerPrintJob(data: { AccountName: string; AccountNumber: string }) {
    this.http
      .post(` http://localhost:4242/api/printer/submit`, data)
      .pipe(catchError(err => throwError(() => err)))
      .subscribe({
        next: response => {
          console.log('Print job submitted successfully:', response);
        },
        error: error => {
          console.error('Error submitting print job:', error);
        },
      });
  }
}
