import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';

export const dashboardRoutes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'ticket',
    component: TicketDetailComponent,
    data: { title: 'Ticket Details', breadcrumb: 'Ticket Details' },
  },
];
