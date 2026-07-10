// Stub for @shared/static — Phase 2 will replace with real implementation
export const COUNTRY_CODES: any[] = [
  { code: 'KE', name: 'Kenya', currency: 'KES', nationality: 'Kenyan' },
  { code: 'UG', name: 'Uganda', currency: 'UGX', nationality: 'Ugandan' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', nationality: 'Tanzanian' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', nationality: 'Rwandan' },
  { code: 'SS', name: 'South Sudan', currency: 'SSP', nationality: 'South Sudanese' },
  { code: 'CD', name: 'DRC', currency: 'CDF', nationality: 'Congolese' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', nationality: 'British' },
  { code: 'US', name: 'United States', currency: 'USD', nationality: 'American' },
  { code: 'EU', name: 'Europe', currency: 'EUR', nationality: 'European' },
];
export const REQUIRED_DOCS: any[] = [
  { id: 'national_id', name: 'National ID', required: true },
  { id: 'passport', name: 'Passport', required: false },
  { id: 'kra_pin', name: 'KRA PIN Certificate', required: true },
  { id: 'utility_bill', name: 'Utility Bill', required: false },
  { id: 'bank_statement', name: 'Bank Statement', required: false },
];

export const FIELDS: any = {
  remitterName: { label: 'Remitter Name', type: 'text', required: true },
  remitterAccount: { label: 'Remitter Account', type: 'text', required: true },
  beneficiaryName: { label: 'Beneficiary Name', type: 'text', required: true },
  beneficiaryAccount: { label: 'Beneficiary Account', type: 'text', required: true },
  beneficiaryBank: { label: 'Beneficiary Bank', type: 'select', required: true },
  amount: { label: 'Amount', type: 'number', required: true },
  currency: { label: 'Currency', type: 'select', required: true },
  purposeCode: { label: 'Purpose Code', type: 'select', required: true },
  chargeOption: { label: 'Charge Option', type: 'select', required: true },
};
export const PROCESSES: any = {
  STATEMENT: 'statement',
  FUND_TRANSFER: 'fund_transfer',
  BILL_PAYMENT: 'bill_payment',
  AIRTIME_PURCHASE: 'airtime_purchase',
  LOAN_REPAYMENT: 'loan_repayment',
};

export const DRCBranchList: any[] = [
  { code: 'KIN', name: 'Kinshasa' },
  { code: 'LUB', name: 'Lubumbashi' },
  { code: 'MBA', name: 'Mbuji-Mayi' },
  { code: 'KIS', name: 'Kisangani' },
];
export const CHECKER_FIELDS: any = {
  transactionType: { label: 'Transaction Type', type: 'select' },
  status: { label: 'Status', type: 'select' },
  dateFrom: { label: 'Date From', type: 'date' },
  dateTo: { label: 'Date To', type: 'date' },
};
