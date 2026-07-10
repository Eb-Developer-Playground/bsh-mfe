import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { TableColorPills } from '../../models/table-fields.models';

@Component({
  selector: 'app-table-pills',
  templateUrl: './table-pills.component.html',
  styleUrls: ['./table-pills.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class TablePillsComponent implements OnInit {
  @Input() color!: 'red' | 'green' | 'gray' | 'orange' | 'orange-1' | string;
  @Input() icon!: string;
  @Input() text!: string;

  cssClassColor!: TableColorPills | string;
  displayText = '';

  constructor() {}

  ngOnInit(): void {
    this.cssClassColor = this.setColor();
    this.displayText = this.setText();
  }

  private setText() {
    const text = `${this.text}`.toLowerCase();

    switch (text) {
      case '0':
        return 'Approved';
      case '1':
        return 'Rejected';
      case '2':
        return 'Pending';
      default:
        return this.text;
    }
  }

  private setColor() {
    const color = `${this.color}`.toLowerCase();

    switch (color) {
      case 'green':
      case 'active':
      case 'created':
      case 'on':
      case '0':
        return '--green';

      case 'red':
      case 'off':
      case 'rejected':
      case 'disabled':
      case '1':
        return '--red';

      case 'orange':
      case 'Pending':
      // eslint-disable-next-line no-duplicate-case,no-fallthrough
      case 'rejected':
      // eslint-disable-next-line no-duplicate-case,no-fallthrough
      case 'disabled':
        return '--orange';
      case 'orange-1':
      // eslint-disable-next-line no-duplicate-case,no-fallthrough
      case 'Pending':
      // eslint-disable-next-line no-duplicate-case,no-fallthrough
      case 'rejected':
      // eslint-disable-next-line no-duplicate-case,no-fallthrough
      case 'disabled':
        return '--orange-1';

      case 'gray':
      case 'deactivated':
      case 'unkwon':
      case 'activedirectory':
      case '2':
      default:
        return '--gray';
    }
  }
}
