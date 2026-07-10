import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-ticket-detail',
  imports: [MatCardModule, MatDividerModule, MatButtonModule, TranslatePipe, RouterModule],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss',
})
export class TicketDetailComponent implements OnInit, OnDestroy {
  customerCIF!: any;
  ticket!: any;
  destroy$: Subject<any> = new Subject<any>();
  public customerPhotos: any;

  constructor(
    private location: Location,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    this.ticket = nav?.extras?.state?.['ticket'];
  }

  ngOnInit(): void {}

  proceed(): void {
    if (this.ticket.status === 'SubmittedToChecker') {
      switch (this.ticket.subject) {
        case 'Cash request 299':
          this.router.navigate([`/services/checker/cash-request-299/${this.ticket.id}/`]);
          break;
        case 'Bulk Upload':
          this.router.navigate([`/services/checker/bulk-upload/${this.ticket.id}/`]);
          break;
        case 'Cash Request 202':
          this.router.navigate([`/services/checker/cash-request202/${this.ticket.id}/`]);
          break;
        case 'Cash Request Cancellation 299':
          this.router.navigate([`/services/checker/cash-request-cancellation299/${this.ticket.id}/`]);
          break;
        case 'Normal MT299':
          this.router.navigate([`/services/checker/normal-mt299/${this.ticket.id}/`]);
          break;
        case 'Fund Transfer MT103':
          this.router.navigate([`/services/checker/fund-transfer-mt103/${this.ticket.id}/`]);
          break;
        case 'Cash Request MT199 Correspondent Query':
          this.router.navigate([`/services/checker/cash-request199-correspondent-query/${this.ticket.id}/`]);
          break;
        case 'Cash Request MT199 Provision of Details':
          this.router.navigate([`/services/checker/cash-request199-details-provision/${this.ticket.id}/`]);
          break;
        case 'MT199 Amendment Confirmation Of MT103':
          this.router.navigate([`/services/checker/cash-request199-confirmation103/${this.ticket.id}/`]);
          break;
        case 'Cash Request 192 Recall':
          this.router.navigate([`/services/checker/cash-request-mt192-recall/${this.ticket.id}/`]);
          break;
        case 'Statement 940/950':
          this.router.navigate([`/services/checker/statement/${this.ticket.id}/`]);
          break;
        case 'Statement 940/950 Cancellation':
          this.router.navigate([`/services/checker/statement-cancellation/${this.ticket.id}/`]);
          break;
      }
    }
    if (this.ticket.status === 'New' || this.ticket.status === 'Pending') {
      switch (this.ticket.subject) {
        case 'Cash request 299':
          this.router.navigate([`/services/transactions/cash-request-299/${this.ticket.id}/`]);
          break;
        case 'Bulk Upload':
          this.router.navigate([`/services/transactions/bulk-upload/${this.ticket.id}/`]);
          break;
        case 'Cash Request 202':
          this.router.navigate([`/services/transactions/cash-request202/${this.ticket.id}/`]);
          break;
        case 'Cash Request Cancellation 299':
          this.router.navigate([`/services/transactions/cash-request-cancellation299/${this.ticket.id}/`]);
          break;
        case 'Normal MT299':
          this.router.navigate([`/services/transactions/normal-mt299/${this.ticket.id}/`]);
          break;
        case 'Fund Transfer MT103':
          this.router.navigate([`/services/transactions/fund-transfer-mt103/${this.ticket.id}/`]);
          break;
        case 'Cash Request MT199 Correspondent Query':
          this.router.navigate([`/services/transactions/cash-request199-correspondent-query/${this.ticket.id}/`]);
          break;
        case 'Cash Request MT199 Provision of Details':
          this.router.navigate([`/services/transactions/cash-request199-details-provision/${this.ticket.id}/`]);
          break;
        case 'MT199 Amendment Confirmation Of MT103':
          this.router.navigate([`/services/transactions/cash-request199-confirmation103/${this.ticket.id}/`]);
          break;
        case 'Cash Request 192 Recall':
          this.router.navigate([`/services/transactions/cash-request-mt192-recall/${this.ticket.id}/`]);
          break;
        case 'Statement 940/950':
          this.router.navigate([`/services/transactions/statement/${this.ticket.id}/`]);
          break;
        case 'Statement 940/950 Cancellation':
          this.router.navigate([`/services/transactions/statement-cancellation/${this.ticket.id}/`]);
          break;
      }
    }
  }

  onRetry(ticket: any): void {
    console.warn('Retry action needs ApiService — ticket:', ticket.id);
  }

  GoBack() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
