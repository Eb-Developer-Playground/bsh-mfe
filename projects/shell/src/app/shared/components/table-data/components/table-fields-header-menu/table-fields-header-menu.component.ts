import { Component, Input, OnInit } from '@angular/core';
import {
  MenuActions,
  MenuOptionsButtons,
} from '../../models/menu-button-action.models';
import { TableFields } from '../../models/table-fields.models';
import { TableDataService } from '../../services/table-data.service';

@Component({
  selector: 'app-table-fields-header-menu',
  templateUrl: './table-fields-header-menu.component.html',
  styleUrls: ['./table-fields-header-menu.component.scss'],
})
export class TableFieldsHeaderMenuComponent implements OnInit {
  @Input() tableField!: TableFields;

  menuOptions: MenuOptionsButtons[] = [
    { label: 'Sort ASC', action: MenuActions.ASC },
    { label: 'Sort DESC', action: MenuActions.DESC },
    { label: 'Hide column', action: MenuActions.HIDE },
    { label: 'Show column(s)', action: MenuActions.SHOW },
  ];

  constructor(private tableDataService: TableDataService) {}

  ngOnInit(): void {}

  menuOptionClick(button: MenuOptionsButtons) {
    const menuOptionsButtons: MenuOptionsButtons = {
      ...button,
      selectedTableField: this.tableField,
    };

    this.tableDataService.setMenuTrigger(menuOptionsButtons);
  }
}
