export interface Channel {
  channel: string;
  status: string;
  createdDate: string;
  blockReason: string;
  subChannel: string;
  level?: number;
  id?: string;
}

export interface ChannelsResponse {
  successful: boolean;
  responseObject: {
    status: string;
    profileCreatedOn: string;
    channels: Channel[];
  };
  statusCode: string;
  statusMessage: string;
}

export interface CustomerLevel {
  subChannel: string;
  channel: string;
  level: number;
}

export interface CustomerProfileDetails {
  customerLevels: CustomerLevel[];
  isSwapBlocked: boolean;
}
