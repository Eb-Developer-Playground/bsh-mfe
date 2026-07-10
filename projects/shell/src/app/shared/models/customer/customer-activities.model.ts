export namespace CustomerActivity {
  export interface CustomerActivities {
    createdBy: string;
    action: string;
    description: string;
    message: string;
    customerId: string;
    source: string;
    channel: string;
    status: string;
    ipAddress: string;
    reference: string;
    deviceOS?: any;
    buildVersion?: any;
  }

  export interface CustomerActivityResponse {
    responseObject: CustomerActivities[];
    statusCode: string;
    statusMessage: string;
    successful: boolean;
  }
}
