import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications.component';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsContentDirective } from './notifications-content.directive';

@NgModule({
  declarations: [NotificationsComponent, NotificationsContentDirective],
  imports: [CommonModule, MatIconModule],
  exports: [NotificationsComponent, NotificationsContentDirective],
})
export class NotificationsModule {}
