export interface IknownAgentDetails {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  serialNumber?: string;
  identityDocumentType?: string;
  identityDocumentNumber?: string;
  address?: string;
  customerId?: string;
  addressType?: string;
  kraPin: string | undefined | null;
  action?: string;
  gender?: string;
  nationality?: string;
  countryOfResidence?: string;
  birthDate?: string;
  placeOfBirth?: string;
  region?: string;
  maritalStatus?: string;
  preferredLanguageCode?: string;
  language?: string;
}
