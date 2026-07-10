// Stub for @shared/dynamic-form — Phase 2 will replace with real implementation
export const FIELD_TYPES = {
  PARAGRAPH: 'paragraph',
  LINE: 'line',
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  DATE: 'date',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  HIDDEN: 'hidden',
  DATETIME: 'datetime',
  LINE_AMOUNT_FIELD: 'line_amount_field',
  BIC_AUTOCOMPLETE_FIELD: 'bic_autocomplete_field',
  EQUITY_SEARCH_SELECT: 'equity_search_select',
};

export interface FieldAttribute {
  key: string;
  label: string;
  field_type: string;
  value?: any;
  required?: boolean;
  options?: any[];
  validators?: any[];
  order?: number;
}

export interface FormFieldBase<T> {
  key: string;
  label: string;
  value?: T;
  required: boolean;
  order: number;
  field_type: string;
  controlType: string;
  options?: any[];
  styleClass: string;
  toast: string;
  type: string;
  placeholder: string;
  autocomplete: string;
  maximum?: number;
  minimum?: number;
  rows?: number;
  readonly: boolean;
  [key: string]: any;
}

export class DynamicFormService {
  fieldAttributeToFormField(fa: FieldAttribute): FormFieldBase<any> {
    return {
      key: fa.key,
      label: fa.label,
      value: fa.value,
      required: fa.required || false,
      order: fa.order || 0,
      field_type: fa.field_type,
      controlType: fa.field_type,
      options: fa.options,
      styleClass: '',
      toast: '',
      type: 'text',
      placeholder: '',
      autocomplete: 'off',
      readonly: false,
      maximum: fa.validators?.find((v: any) => v?.max)?.max,
    };
  }

  toFormGroup(fields: FormFieldBase<any>[]): any {
    const group: any = {};
    fields.forEach(field => {
      group[field.key] = '';
    });
    return group;
  }
}

export class FilterSpecCharsPipe {
  transform(value: string): string { return value || ''; }
}
