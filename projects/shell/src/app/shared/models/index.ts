export type { User } from './user.model';
export type { RequestSessionToken, SessionToken } from './session';
export type { AgentFormAreValid, AgentFormObj } from './agent.model';
export { FormNames } from './agent.model';
export type { AccountDetails } from './account-details.model';
export type { ISearchOptions } from './search-options';
export { SearchableItem } from '@app/shared/models/searchable';

export enum AUTH_VERSION {
  VERSION_1 = '1',
  VERSION_2 = '2',
}

export interface MenuItem {
  name: string;
  icon: string;
  path: string;
  sub_menu?: any;
  children?: MenuItem[];
  isExpanded?: boolean;
}

export interface Currency {
  currency: string;
  bankId: string;
  default?: boolean;
}

export interface Service {
  title: string;
  text: string;
  icon: string;
  value: string;
  url?: string;
}

export interface ServiceSection {
  title: string;
  text: string;
  services: Service[];
}

export enum STORAGE_KEYS {
  CONTEXT_DATA = 'context',
  DEDUPE_RESPONSE = 'dedupe',
  TICKET_RESPONSE = 'ticket',
  IPRS_STATUS = 'IPRS',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  IPRS_RESPONSE = 'IPRS',
  KRA_RESPONSE = 'KRA',
  STEPPER_SUBJECT = 'subject',
}
