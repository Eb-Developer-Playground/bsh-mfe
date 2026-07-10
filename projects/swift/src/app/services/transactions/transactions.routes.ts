import { Routes } from '@angular/router';
import { TransactionsComponent } from './transactions.component';

export const transactionsRoutes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    children: [
      {
        path: 'bulk-upload/:ticketId',
        loadComponent: () => import('./bulk-upload/bulk-upload.component').then(m => m.BulkUploadComponent),
        data: { title: 'Bulk Upload', breadcrumb: 'Bulk Upload' },
      },
      {
        path: 'cash-request202/:ticketId',
        loadComponent: () => import('./cash-request202/cash-request202.component').then(m => m.CashRequest202Component),
        data: { title: 'Cash Request 202', process: 'Cash request MT202', breadcrumb: 'Cash Request 202' },
      },
      {
        path: 'cash-request-cancellation299/:ticketId',
        loadComponent: () => import('./cash-request-cancellation299/cash-request-cancellation299.component').then(m => m.CashRequestCancellation299Component),
        data: { title: 'Cash Request Cancellation 299', process: 'Cash Request Cancellation MT299', breadcrumb: 'Cash Request Cancellation 299' },
      },
      {
        path: 'cash-request-299/:ticketId',
        loadComponent: () => import('./cash-request299/cash-request299.component').then(m => m.CashRequest299Component),
        data: { title: 'Cash Request 299', process: 'Cash request MT299', breadcrumb: 'Cash Request 299' },
      },
      {
        path: 'normal-mt299/:ticketId',
        loadComponent: () => import('./normal-mt299/normal-mt299.component').then(m => m.NormalMt299Component),
        data: { title: 'Normal MT299', process: 'Normal MT299', breadcrumb: 'Normal MT299' },
      },
      {
        path: 'fund-transfer-mt103/:ticketId',
        loadComponent: () => import('./fund-transfer-mt103/fund-transfer-mt103.component').then(m => m.FundTransferMt103Component),
        data: { title: 'Fund Transfer MT103', process: 'Customer Fund Transfer MT103', breadcrumb: 'Fund Transfer MT103' },
      },
      {
        path: 'cash-request199-correspondent-query/:ticketId',
        loadComponent: () => import('./cash-request199-correspondent-query/cash-request199-correspondent-query.component').then(m => m.CashRequest199CorrespondentQueryComponent),
        data: { title: 'MT199 Amendment Correspondent Query', process: 'Amendment 199', breadcrumb: 'MT199 Amendment Correspondent Query' },
      },
      {
        path: 'cash-request199-details-provision/:ticketId',
        loadComponent: () => import('./cash-request199-details-provision/cash-request199-details-provision.component').then(m => m.CashRequest199DetailsProvisionComponent),
        data: { title: 'MT199 Amendment Provision Of Details', process: 'Amendment 199', breadcrumb: 'MT199 Amendment Provision Of Details' },
      },
      {
        path: 'cash-request199-confirmation103/:ticketId',
        loadComponent: () => import('./cash-request199-confirmation103/cash-request199-confirmation103.component').then(m => m.CashRequest199Confirmation103Component),
        data: { title: 'MT199 Amendment Confirmation Of MT103', process: 'Amendment 199', breadcrumb: 'MT199 Amendment Confirmation Of MT103' },
      },
      {
        path: 'cash-request-mt192-recall/:ticketId',
        loadComponent: () => import('./cash-request192-recall/cash-request192-recall.component').then(m => m.CashRequest192RecallComponent),
        data: { title: 'Cancellation / Recall MT 192', process: 'Cancellation 192', breadcrumb: 'Cancellation / Recall MT 192' },
      },
      {
        path: 'statement/:ticketId',
        loadComponent: () => import('./statement/statement.component').then(m => m.StatementComponent),
        data: { title: 'Statement 940/950', process: 'Statement 940/950', breadcrumb: 'Statement 940/950' },
      },
      {
        path: 'statement-cancellation/:ticketId',
        loadComponent: () => import('./statement-cancellation/statement-cancellation.component').then(m => m.StatementCancellationComponent),
        data: { title: 'Statement 940/950 Cancellation', breadcrumb: 'Statement 940/950 Cancellation' },
      },
    ],
  },
];
