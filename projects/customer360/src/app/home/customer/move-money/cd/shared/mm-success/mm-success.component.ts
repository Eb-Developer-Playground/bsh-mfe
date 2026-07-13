import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TicketsService } from '@app/core/services';
import { SessionService } from '@app/shared/services';
import { TranslatePipe } from '@ngx-translate/core';
import { TransformCurrencyPipe } from '@app/shared/pipes/transform-currency.pipe';

@Component({
  selector: 'app-mm-success',
  templateUrl: './mm-success.component.html',
  styleUrl: './mm-success.component.scss',
  imports: [TranslatePipe, TransformCurrencyPipe, RouterLink, MatButtonModule],
})
export class MmSuccessComponent implements OnDestroy {
  destroy$: Subject<any> = new Subject<any>();
  transferDetails: any;
  ticketID = localStorage.getItem('movemoney-ticketid');

  constructor(
    public dialog: MatDialog,
    private sessionServie: SessionService,
    private ticketService: TicketsService
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getTransferDetails();
  }

  private getTransferDetails(): void {
    this.transferDetails = JSON.parse(
      <string>localStorage.getItem('moveMoneyValues')
    );
  }

  printReceipt() {
    window.print();
  }
}
