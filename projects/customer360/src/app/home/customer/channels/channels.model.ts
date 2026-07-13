export interface ChannelsResponse {
  responseObject: {
    channels: Channel[];
    status: string;
    profileCreatedOn: string;
  };
  statusCode: string;
  statusMessage: string;
  successful: boolean;
}

export interface Channel {
  channel: string;
  status: string;
  createdDate: string;
  level?: number;
  blockReason: string;
  subChannel: string;
  id?: string;
}

export interface ChannelList {
  // id: number;
  id?: string;
  channelId?: number;
  channelBlockReason?: string;
  channel: string;
  subChannel: string;
  level?: number;
  isChannelActive?: boolean;
  isChannelBlocked?: boolean;
  blockedReason?: string;
  channelCreatedOn?: string;
  channelModifiedOn?: string;
  passcodeInfo?: string;
}

export interface AccChannels {
  channel: ChannelList;
  accountPermissions?: any;
}

export interface CustomerProfileData {
  actionName?: string;
  comment: string;
  customerId: string;
  channel?: string;
  phoneNumber: string;
  action?: string;
  level?: number;
  subChannel?: string;
}

export interface LinkedProfileAccount {
  responseObject: Account[];
  statusCode: string;
  statusMessage: string;
  successful: boolean;
}

export interface Account {
  accountNumber: string;
  cif: string;
  bankId: string;
  countryCode: string;
  accountBalance: any;
  accountName: string;
  accountType: string;
  accountCurrency: String;
  nickName: any;
  status: string;
  schemeCode: string;
  accountAuthorization: number;
  isRelatedAccount: boolean;
  openDate: string;
  balanceHidden: boolean;
  cards: any;
  accountProfileID: number;
  requiresMultiapproval: boolean;
  lastSanctionLimit: any;
  lastSanctionDate: string;
  lastExpiryDate: string;
  totalDue: string;
  uptoDateInt: any;
  installmentAmount: string;
  nextPaymentDueInNumOfDays: number;
  remainingNumberOfInstalments: any;
  percentCompleted: Number;
  productName: string;
  disbursedAmount: string;
  disbursementAmountSpecified: boolean;
  nextDueDate: string;
  ecoCode: any;
  schemeType: string;
}

export interface CustomerProfileDetails {
  customerLevels: CustomerLevel[];
  isSwapBlocked: boolean;
}

export interface CustomerLevel {
  channel: string;
  level: number;
  subChannel?: string;
}
