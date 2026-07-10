import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button-item-menu',
  templateUrl: './button-item-menu.component.html',
  styleUrls: ['./button-item-menu.component.scss'],
})
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
