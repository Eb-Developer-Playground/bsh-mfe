import { InstantCardIssuanceFormKeysT } from '@app/home/customer/card-issuance/card-issuance.models';

export const ISSUANCE_FORM_KEYS: (keyof InstantCardIssuanceFormKeysT)[] = [
  'accountNumber',
  'accountName',
  'cardType',
  'cardCurrency',
  'cardEmbossingName',
  'cardPAN',
  'cardPANValid',
  'charges',
  'chargeableAccount',
  'withdrawalLimit',
  'ecommerceLimit',
  'taxAmount',
  'chargeAmount',
];

const testCard = {
  id: 14,
  name: 'VISA CLASSIC CREDIT',
  code: 'CRD_ISS_KES_CONSUMER_CLASSIC',
  group: 'INSTANT',
  countryCode: 'KE',
  categoryId: 5,
  categoryName: 'CREDIT CARD',
  fullName: 'CREDIT CARD VISA CLASSIC CREDIT',
};

const isOff = true;
