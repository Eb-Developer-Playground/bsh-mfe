import { MenuActions } from 'src/app/shared/components/table-data/models/menu-button-action.models';
import {
  FieldType,
  FormatType,
  TableActionsButtons,
  TableData,
  TableFields,
} from 'src/app/shared/components/table-data/models/table-fields.models';
import { Customer } from '../../models/customer/customer.model';

export const TABLEFIELDS: TableFields[] = [
  {
    label: 'First Name',
    name: 'firstName',
    type: FieldType.STRING,
    sorted: true,
  },
  {
    label: 'Second Name',
    name: 'lastName',
    type: FieldType.STRING,
    sorted: true,
    widthPercentage: 15,
  },
  {
    label: 'Transaction type',
    name: 'transactionType',
    type: FieldType.STRING,
    sorted: true,
    widthPercentage: 15,
  },
  {
    label: 'Account number',
    name: 'accountNumber',
    type: FieldType.STRING,
    sorted: true,
    widthPercentage: 15,
  },
  {
    label: 'Account type',
    name: 'accountType',
    type: FieldType.STRING,
    sorted: true,
    widthPercentage: 15,
  },
  {
    label: 'Date',
    name: 'date',
    type: FieldType.DATE,
    format: FormatType['YYYY/MM/DD'],
    sorted: true,
    widthPercentage: 15,
  },
  {
    label: 'Status',
    name: 'status',
    type: FieldType.PILLS,
    sorted: true,
    widthPercentage: 15,
  },
];

export const DATA: any = {
  currentPageNumber: 1,
  currentPageSize: 5,
  hasNext: false,
  hasPrevious: false,
  itemsCount: 5,
  pageCount: 1,
  items: [
    {
      firstName: 'Wendy',
      lastName: 'Kangethe',
      transactionType: 'List label',
      accountNumber: '1234 234 234',
      accountType: 'Individual',
      date: '2022/12/12',
      status: 1,
    },
    {
      firstName: 'Daniela',
      lastName: 'Rodriguez',
      transactionType: 'List label',
      accountNumber: '1234 333 333',
      accountType: 'Individual',
      date: '2022/12/11',
      status: 2,
    },
    {
      firstName: 'Thais',
      lastName: 'Martinez',
      transactionType: 'List label',
      accountNumber: '1234 000 000',
      accountType: 'Individual',
      date: '2022/12/10',
      status: 0,
    },
    {
      firstName: 'Jean',
      lastName: 'Cartaya',
      transactionType: 'List label',
      accountNumber: '1234 000 111',
      accountType: 'Individual',
      date: '2022/12/09',
      status: 1,
    },
    {
      firstName: 'Wendy',
      lastName: 'Kangethe',
      transactionType: 'List label',
      accountNumber: '1234 234 234',
      accountType: 'Individual',
      date: '2022/12/12',
      status: 2,
    },
    {
      firstName: 'Daniela',
      lastName: 'Rodriguez',
      transactionType: 'List label',
      accountNumber: '1234 333 333',
      accountType: 'Individual',
      date: '2022/12/11',
      status: 0,
    },
    {
      firstName: 'Thais',
      lastName: 'Martinez',
      transactionType: 'List label',
      accountNumber: '1234 000 000',
      accountType: 'Individual',
      date: '2022/12/10',
      status: 1,
    },
    {
      firstName: 'Jean',
      lastName: 'Cartaya',
      transactionType: 'List label',
      accountNumber: '1234 000 111',
      accountType: 'Individual',
      date: '2022/12/09',
      status: 1,
    },
  ],
};

export const TABLEACTIONSBUTTONS: TableActionsButtons[] = [
  {
    icon: 'ic-plus',
    label: 'Create Role',
    action: MenuActions.CREATEROLE,
  },
  {
    icon: 'ic-plus',
    label: 'Assign Role',
    action: MenuActions.ASSIGNROLE,
  },
];
