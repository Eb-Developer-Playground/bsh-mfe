import { Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  OnChanges,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { FieldType, TableFields } from '../../models/table-fields.models';
import { TableDataService } from '../../services/table-data.service';

@Component({
  selector: 'app-table-fields-template',
  templateUrl: './table-fields-template.component.html',
  styleUrls: ['./table-fields-template.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class TableFieldsTemplateComponent implements OnInit, OnChanges {
  @Input() tableField!: TableFields;
  @Input() data: any;

  @ViewChild('STRING', { static: true }) stringTemplate!: TemplateRef<any>;
  @ViewChild('DATE', { static: true }) dateTemplate!: TemplateRef<any>;
  @ViewChild('IMG', { static: true }) imgTemplate!: TemplateRef<any>;
  @ViewChild('PILLS', { static: true }) pillsTemplate!: TemplateRef<any>;
  @ViewChild('NUMBER', { static: true }) numberTemplate!: TemplateRef<any>;
  @ViewChild('RADIOBUTTON', { static: true })
  radioButtonTemplate!: TemplateRef<any>;
  @ViewChild('CHECKBUTTON', { static: true })
  checkButtonTemplate!: TemplateRef<any>;
  @ViewChild('MENUACTIONS', { static: true })
  menuActionsTemplate!: TemplateRef<any>;
  @ViewChild('DYNAMICMENUACTIONS', { static: true })
  menuDynamicActionsTemplate!: TemplateRef<any>;
  @ViewChild('EXTRA', { static: true }) menuExtraTemplate!: TemplateRef<any>;
  @ViewChild('EXPANDED', { static: true }) expandedTemplate!: TemplateRef<any>;
  @ViewChild('EXPANDEDDETAILS', { static: true })
  expandedDetailsTemplate!: TemplateRef<any>;

  radioSelectedValue = '';
  checked: any;

  expanded = false;

  constructor(private tableDataService: TableDataService) {}

  ngOnInit(): void {}

  dynamicTemplateType(templateType: FieldType) {
    if (!templateType) {
      return this.stringTemplate;
    }

    const templateTypes = {
      [FieldType.STRING]: this.stringTemplate,
      [FieldType.DATE]: this.dateTemplate,
      [FieldType.IMG]: this.imgTemplate,
      [FieldType.PILLS]: this.pillsTemplate,
      [FieldType.NUMBER]: this.numberTemplate,
      [FieldType.RADIO]: this.radioButtonTemplate,
      [FieldType.CHECK]: this.checkButtonTemplate,
      [FieldType.MENUACTIONS]: this.menuActionsTemplate,
      [FieldType.DYNAMICMENUACTIONS]: this.menuDynamicActionsTemplate,
      [FieldType.EXTRA]: this.menuExtraTemplate,
      [FieldType.EXPANDED]: this.expandedTemplate,
      [FieldType.EXPANDEDDETAILS]: this.expandedDetailsTemplate,
    };
    return templateTypes[templateType];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tableField.type === 'CHECK') {
      if (changes?.['data']?.currentValue?.selected) {
        this.data = changes['data'].currentValue;
      }
    }
  }

  onChange(event: any) {}

  radioOptionSelected(data: any) {
    this.radioSelectedValue = data[this.tableField.name];
    this.tableDataService.setSelectedRow(data);
  }

  checkBoxSelected(data: any, event: boolean) {
    data = {
      ...data,
      selected: event,
    };
    this.tableDataService.setSelectedRow(data);
  }

  menuActionItemSelected(data: any, item: any) {
    this.tableDataService.setSelectedRow({
      ...data,
      rowMenuActionItem: item,
    });
  }

  expandedButtonClick(event: any) {
    this.expanded = !this.expanded;
    const _event = !this.expanded ? null : event;
    this.tableDataService.setExpanded(_event);
    //event.stopPropagation();
  }
}
