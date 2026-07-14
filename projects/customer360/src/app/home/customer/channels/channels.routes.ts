import { Routes } from '@angular/router';
import { ChannelsComponent } from './channels.component';
import { ChannelTransDetailsComponent } from './channel-activities/channel-trans-details/channel-trans-details.component';
import { RestrictChannelAccountComponent } from './restrict-channel-account/restrict-channel-account.component';
import { ListScheduledPaymentsComponent } from './scheduled-payments/list-scheduled-payments/list-scheduled-payments.component';
import { CancelScheduledPaymentsComponent } from './scheduled-payments/cancel-scheduled-payments/cancel-scheduled-payments.component';
import { UpdateScheduledPaymentsComponent } from './scheduled-payments/update-scheduled-payments/update-scheduled-payments.component';
import { ViewScheduledPaymentsComponent } from './scheduled-payments/view-scheduled-payments/view-scheduled-payments.component';
import { DelinkAccountComponent } from './delink-account/delink-account.component';
import { LinkAccountComponent } from './link-account/link-account.component';
import { DelinkPaypalAccountComponent } from './delink-paypal-account/delink-paypal-account/delink-paypal-account.component';
import { PaypalAccountDetailsComponent } from './paypal-account/paypal-account-details/paypal-account-details/paypal-account-details.component';

export const CHANNELS_ROUTES: Routes = [
  { path: '', component: ChannelsComponent },
  { path: 'trans-view-details', component: ChannelTransDetailsComponent },
  { path: 'restrict-account', component: RestrictChannelAccountComponent },
  { path: 'delink-account', component: DelinkAccountComponent },
  { path: 'link-account', component: LinkAccountComponent },
  {
    path: 'scheduled-payments',
    component: ListScheduledPaymentsComponent,
    data: { title: 'Scheduled Payments', breadcrumb: 'scheduled-payments' },
  },
  {
    path: 'scheduled-payment-details',
    component: ViewScheduledPaymentsComponent,
    data: {
      title: 'Scheduled Payments details',
      breadcrumb: 'scheduled-payments',
    },
  },
  {
    path: 'update-scheduled-payments',
    component: UpdateScheduledPaymentsComponent,
    data: {
      title: 'Scheduled Payments update',
      breadcrumb: 'scheduled-payments',
    },
  },
  {
    path: 'cancel-scheduled-payments',
    component: CancelScheduledPaymentsComponent,
    data: { title: 'Scheduled Payments', breadcrumb: 'scheduled-payments' },
  },
  { path: 'delink-paypal-account', component: DelinkPaypalAccountComponent },
  { path: 'paypal-account-details', component: PaypalAccountDetailsComponent },
];
