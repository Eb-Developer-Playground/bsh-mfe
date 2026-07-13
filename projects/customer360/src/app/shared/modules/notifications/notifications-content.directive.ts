import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[notificationsContent]',
  host: {},
  standalone: true,
})
export class NotificationsContentDirective {
  @Input('notificationsContent') name!: string;
  constructor(public template: TemplateRef<any>) {}
}
