export enum FormNames {
  VALIDATION = 'validation',
  APPROVAL = 'approval',
  HIGHRISK = 'highRisk',
  FUNCTIONS = 'functions',
  ADDITIONALINFORMATION = 'additionalInformation',
  LIMITS = 'limits',
  KRAPIN = 'krapin',
}

export interface AgentFormAreValid {
  validation?: boolean;
  approval?: boolean;
  highRisk?: boolean;
  functions?: boolean;
  limits?: boolean;
  additionalInformation?: boolean;
}

export interface AgentFormObj {
  formName: FormNames;
  values: any;
  valid: boolean;
}

// export interface AgentFunctionsControls {
//     code: number;
//     name: string;
//     label: string;

// }

export interface AgentUploadDocumentPayload {
  requestId: string;
  bankId: string;
  accId: string;
  acctCode: string;
  custName: string;
  remarks: string;
  custId: string;
  sigPowerNum: string;
  imageAccessCode: string;
  sigExpDt: string;
  sigEffDt: string;
  sigFile: string;
  pictureExpDt: string;
  pictureEffDt: string;
  pictureFile: string;
  ticketId: string;
}
