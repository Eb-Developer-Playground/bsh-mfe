export interface Account {
  accountNumber?: string;
  accountName?: string;
  accountType?: string;
  currency?: string;
  status?: string;
  [key: string]: any;
}

export const model = {} as any;
