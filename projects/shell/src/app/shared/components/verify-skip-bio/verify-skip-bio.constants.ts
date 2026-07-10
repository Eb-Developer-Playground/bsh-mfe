import { IDocumentSpec } from '@shared/modules/upload-docs';
import {
  ReasonOption,
  ReasonOptionItem,
} from '@shared/models/verify-skip-bio-models';

export const DEV_HOSTNAMES = new Set([
  'servicehub-customer-360-uat.equitygroupholdings.com',
  'branchservicehub-customer-360-dev.azurewebsites.net',
  'localhost',
]);

export const REASON_OPTIONS: Record<string, ReasonOptionItem> = {
  CONTACT_CENTER: {
    code: ReasonOption.CONTACTCENTER,
    title: 'COMMON.CONTACT_CENTRE',
    description: '',
  },
  DIGITAL_SUPPORT: {
    code: ReasonOption.DIGITALSUPPORT,
    title: 'COMMON.DIGITAL_SUPPORT',
    description: '',
  },
  CUSTOMER_NOT_PRESENT: {
    code: ReasonOption.CUSTOMERNOTPRESENT,
    title: 'CUSTOMER.CUSTOMER-PROFILE.CUSTOMER-NOT-PRESENT',
    description: '',
  },
};

export const DEFAULT_REASON_OPTIONS: ReasonOptionItem[] = [
  REASON_OPTIONS['CONTACT_CENTER'],
  REASON_OPTIONS['DIGITAL_SUPPORT'],
  REASON_OPTIONS['CUSTOMER_NOT_PRESENT'],
];

export const ACTIONS_NO_DOCUMENTS_REQUIRED: string[] = ['PutActionHere'];

export const BANKS_REQUIRING_DORMANT_CHECK: string[] = ['56'];

export const UPLOAD_DOCUMENTS: IDocumentSpec[] = [
  {
    name: 'Additional Document',
    description: 'AdditionalDocument',
    fileTypes: ['image/png', 'image/jpeg', 'application/pdf'],
    maxSize: 10000 * 1024,
    required: true,
    docCode: '059',
  },
];

export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];
export const MAX_FILE_SIZE = 1024000;
export const SUPER_USER_WORK_CLASS = '080';
export const DRC_COUNTRY_CODE = 'CD';
