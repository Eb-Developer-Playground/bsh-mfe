import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { NotificationsContentDirective } from './notifications-content.directive';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, NotificationsContentDirective],
})
export class NotificationsComponent implements OnInit {
  @Input()
  textTemplate!: TemplateRef<any>;
  @Input() title!: string;
  @Input() text = '';
  @Input() status: 'success' | 'info' | 'warning' | 'danger' = 'success';
  @Input() showLeftBorder = false;

  @ContentChild(NotificationsContentDirective)
  notificationsContentTemplate: NotificationsContentDirective | null = null;

  notificationClass = {};
  leftBorderClass = {};

  constructor() {}

  ngOnInit(): void {
    this.notificationClass = {
      'notification-success': this.status === 'success',
      'notification-danger': this.status === 'danger',
      'notification-info': this.status === 'info',
      'notification-warning': this.status === 'warning',
    };

    this.leftBorderClass = {
      'left-border-danger': this.status === 'danger' && this.showLeftBorder,
      'left-border-success': this.status === 'success' && this.showLeftBorder,
      'left-border-info': this.status === 'info' && this.showLeftBorder,
      'left-border-warning': this.status === 'warning' && this.showLeftBorder,
    };
  }
}
