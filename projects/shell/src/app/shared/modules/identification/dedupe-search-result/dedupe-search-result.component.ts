import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import {
  FieldType,
  TableData,
  TableFields,
} from 'src/app/shared/components/table-data/models/table-fields.models';
import { ICIFItem } from '../dedupe.service';
import { Customer } from 'src/app/shared/models/customer/customer.model';

@Component({
  selector: 'app-dedupe-search-result',
  templateUrl: './dedupe-search-result.component.html',
  styleUrls: ['./dedupe-search-result.component.scss'],
})
export class DedupeSearchResultComponent implements OnInit {
  @Input() ICIFItem!: ICIFItem[];
  @Output() selectedICIFItem: EventEmitter<ICIFItem> =
    new EventEmitter<ICIFItem>();

  warningTitle = 'There is more than one CIF tied to this customer';
  warningText = "Please review all the CIF's below before proceeding to ensure";

  data: TableData & Customer.CustomerStatusResponse = {
    currentPageNumber: 1,
    currentPageSize: 100,
    hasNext: true,
    hasPrevious: true,
    items: [],
    itemsCount: 0,
    pageCount: 100,
    responseObject: '',
    statusCode: '',
    statusMessage: '',
    successful: true,
  };

  tableFields: TableFields[] = [
    {
      name: 'radioIndexId' /*unique value from the data example cif, id number*/,
      type: FieldType.RADIO,
      widthPercentage: 5,
    },
    {
      label: 'Customer name',
      name: 'firstName',
      type: FieldType.STRING,
      widthPercentage: 25,
      sorted: false,
      filter: false,
    },
    {
      label: 'CIF',
      name: 'cifId',
      type: FieldType.STRING,
      widthPercentage: 15,
      sorted: false,
      filter: false,
    },
    // , {
    //   label: 'Profile type',
    //   name: 'createdOnUtc',
    //   type: FieldType.STRING,
    //   sorted: true,
    //   widthPercentage: 15
    // },
    {
      label: 'Profile Status',
      name: 'suspendedFlg',
      type: FieldType.PILLS,
      sorted: false,
      widthPercentage: 15,
      filter: false,
    },
    //    {
    //   label: 'Last viewed',
    //   name: 'suspendedFlg',
    //   type: FieldType.PILLS,
    //   sorted: true,
    //   widthPercentage: 15,
    //   filter: true,

    // },{
    //       {
    //       label: 'Action',
    //       name: 'extra',
    //       type: FieldType.EXTRA,
    //       value: '<p class="color-primary text-center mat-body-1"> Select CIF </p>',
    //       widthPercentage: 15,

    //  }
  ];

  ngOnInit(): void {
    this.ICIFItem;

    this.data = {
      ...this.data,
      items: this.ICIFItem.map(item => {
        return {
          ...item,
          firstName: `${item.firstName}  ${item.lastName}`,
          suspendedFlg: item.suspendedFlg === 'Y' ? 'Disabled' : 'Active',
          radioIndexId: item.cifId,
        };
      }),
    };

    //console.log(this.data);
  }

  tableSelectedRowEventHandler(event: any) {
    this.selectedICIFItem.emit(event);
  }

  tableActionsButtonHandler(event: any) {}

  tableFilter(event: any) {}

  loadData(event: any) {}
}
