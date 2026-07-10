import { Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { NotificationsContentDirective } from './notifications-content.directive';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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
