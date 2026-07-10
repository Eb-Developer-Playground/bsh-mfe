import { Directive, Input, TemplateRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[notificationsContent]',
  host: {},
})

export class NotificationsContentDirective {
  @Input('notificationsContent') name!: string;
  constructor(public template: TemplateRef<any>) {}
}
