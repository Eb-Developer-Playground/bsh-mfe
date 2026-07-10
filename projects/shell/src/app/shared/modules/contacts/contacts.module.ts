import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
  EmailsArrayComponent,
  PhoneNumberGroupComponent,
  PhoneNumbersArrayComponent,
} from './components';
import { ContactsComponent } from './contacts.component';
import { NotificationsModule } from '../notifications';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContactsComponent,
    PhoneNumbersArrayComponent,
    EmailsArrayComponent,
    PhoneNumberGroupComponent,
    NotificationsModule,
  ],
  exports: [
    ContactsComponent,
    PhoneNumbersArrayComponent,
    EmailsArrayComponent,
    PhoneNumberGroupComponent,
  ],
})
export class ContactsModule {}
