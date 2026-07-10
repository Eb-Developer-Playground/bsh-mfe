import { TableFields } from './table-fields.models';

export interface GeneralResponse {
  statusMessage: string;
  statusCode: string;
  successful: boolean;
  responseObject: any;
}

export enum MenuActions {
  ASC = 'asc',
  DESC = 'desc',
  HIDE = 'hide',
  SHOW = 'show',
  REMOVE = 'Remove',
  CREATEROLE = 'createRole',
  ASSIGNROLE = 'assignRole',
  CREATEPERMISSION = 'createPermission',
  CREATECOUNTRY = 'createcountry',
  CREATEDEPARTMENT = 'createDepartment',
  CREATELIMIT = 'createlimit',
  ASSIGNLIMIT = 'assignLimit',
  RESETLOGIN = 'resetLogin',
  ADDUSER = 'addUser',
  ASSIGNPERMISSIONTOROLE = 'assignPermissionToRole',
  ASSIGNPERMISSIONTOUSER = 'assignPermissionToUser',
  FILTER = 'filter',
  ACTIVATEDEACTIVATE = 'activate_deactivate',
  EDIT = 'Edit',
  DOWNLOAD = 'DOWNLOAD',
  REASSIGNTICKETS = 'Reassign_tickets',
  SEARCH = 'search',
  NEWCHEQUEREQUEST = 'New Cheque Request',
}

export interface MenuOptionsButtons {
  label: string;
  action: MenuActions;
  selectedTableField?: TableFields;
}
