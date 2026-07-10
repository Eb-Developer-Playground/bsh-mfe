import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

export enum MessageBoxType {
  SUCCESS = 'success',
  DANGER = 'danger',
  INFO = 'info',
  WARNING = 'warning',
  PRIMARY = 'primary',
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
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private dismissSubject = new Subject<void>();

  show(title: string | null, message: string, type?: MessageBoxType, duration?: number): void {
    console.warn(`[ToastService] ${type || 'info'}:`, title, message);
  }

  dismissed(): Observable<void> {
    return this.dismissSubject.asObservable();
  }
}
