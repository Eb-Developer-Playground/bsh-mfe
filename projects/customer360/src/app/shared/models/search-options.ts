export interface ISearchOptions {
  bank_id: string;
  options: option[];
}

export interface option {
  name: string;
  value?: string;
  default?: boolean;
  validators: any[];
}
