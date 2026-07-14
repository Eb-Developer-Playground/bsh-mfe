export namespace Customer {
  export interface CustomerStatusResponse {
    statusMessage: string;
    statusCode: string;
    successful: boolean;
    responseObject: any;
  }
}
