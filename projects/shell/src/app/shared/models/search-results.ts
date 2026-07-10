import { TAccountDetails } from '@shared/models/common/account.model';

export type AccountManagementObject = {
  bankID: string | null;
  cif: string | null;
};
export type TIdentification = {
  expiryDate: string | null;
  id: string | null;
  type: string;
};

export type TPreferredAddress = {
  address1: string;
  address2: string;
  address3: string;
  cityCode: string;
  cityCodeDesc: string;
  countryCode: string;
  pinCode: string;
  stateCode: string;
};

export type TCustomerProfile = {
  accounts: TAccountDetails[];
  alienIdExpDate: string;
  bankID: string;
  cif: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  gender: string;
  identifications: TIdentification[];
  kraPin: string;
  retCorpFlg: string;
  lastName: string;
  maritalStatus: string;
  memo: string | null;
  passportExpDate: string;
  phoneNumber1: string;
  phoneNumber2: string;
  postalCode: string | null;
  preferredAddress: TPreferredAddress;
  preferredDocDesc: string;
  prefDocumentID: string;
  preferredDocExpDate: string;
  relatedAccounts: TAccountDetails[];
  shortName: string;
  title: string;
};
