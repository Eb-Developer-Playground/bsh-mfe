export enum MessageBoxType {
  SUCCESS = 'success',
  DANGER = 'danger',
  PRIMARY = 'primary',
  WARNING = 'warning',
  INFO = 'info',
  ERROR = 'error',
}

export interface SnackbarConfig {
  title: string;
  text: string;
  type: MessageBoxType;
  duration?: number;
  callBackButtonLabel?: string;
  callBack?: () => {};
  withTranslations?: boolean;
  labelWithTranslations?: boolean;
  translationVariables?: any;
}
