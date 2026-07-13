import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastComponent } from './toast.component';
import { MessageBoxType } from './models';
import {
  MatSnackBar,
  MatSnackBarDismiss,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private snackBarRef!: MatSnackBarRef<any>;
  private snackBar = inject(MatSnackBar);

  public show(
    title: string | null,
    text: string,
    type: MessageBoxType,
    duration: number = 5000,
    callBackButtonLabel?: string,
    callBack?: () => any,
    withTranslations: boolean = true,
    labelWithTranslations: boolean = true,
    translationVariables: any = null
  ) {
    this.snackBarRef = this.snackBar.openFromComponent(ToastComponent, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      data: {
        title,
        text,
        type,
        callBackButtonLabel,
        callBack,
        withTranslations,
        labelWithTranslations,
        translationVariables,
      },
      duration: duration,
    });
  }

  public dismissed(): Observable<MatSnackBarDismiss> {
    return this.snackBarRef?.afterDismissed();
  }
}
