import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-button-item-menu',
  templateUrl: './button-item-menu.component.html',
  styleUrls: ['./button-item-menu.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ButtonItemMenuComponent {
  @Input() menuElementsArray!: { label: string; action: string }[];
  @Input() icon = 'ic-nav';

  @Output() menuSelectedEvent = new EventEmitter<{
    label: string;
    action: string;
  }>();

  emit(menu: { label: string; action: string }) {
    this.menuSelectedEvent.emit(menu);
  }
}
