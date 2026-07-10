import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications.component';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsContentDirective } from './notifications-content.directive';

@NgModule({

  imports: [
      CommonModule,
      MatIconModule,
      NotificationsComponent,
      NotificationsContentDirective,
    ],
  exports: [NotificationsComponent, NotificationsContentDirective],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsModule {}
