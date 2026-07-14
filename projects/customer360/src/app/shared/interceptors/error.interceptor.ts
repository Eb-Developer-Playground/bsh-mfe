import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { inject, Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../services';
import { MessageBoxType, ToastService } from '../modules/toast';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private injector = inject(Injector);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  private get session(): SessionService {
    return this.injector.get(SessionService);
  }


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        //handle toast shows or not
        const skipToast = !!req.headers.get('skipToast');
        let url2: any = error.url;
        const url = new URL(url2);
        const path = '';
        // const path = url.pathname;
        if ([401, 403, 500].includes(error.status)) {
          const message = error.message;
          this.toast.show(
            error.statusText + ' - ' + error?.error?.statusMessage,
            message,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
          if (message == 'Invalid token') {
            this.logoutCallback();
          } else {
            this.handlerError(error.status, error);
          }
        } else if ([404].includes(error.status)) {
          this.toast.show(
            '404 Error',
            path,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        } else if ([400].includes(error.status)) {
          this.toast.show(
            '',
            error.error.statusMessage,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        } else if (error.url === 'https://localhost:8443/SGIFPCapture') {
          this.toast.show(
            'Bio Error',
            error.message,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        } else {
          if (this.badRequestExceptionHandler()) return throwError(error);
          // Handle non 401, 500 errors
          if (error?.error?.statusMessage && !skipToast) {
            const msg =
              error.statusText +
              '  ' +
              error.status +
              '  ' +
              error?.error?.statusMessage;
            this.toast.show(
              '',
              msg,
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          } else if (error?.error?.responseObject && !skipToast) {
            const msg =
              error.statusText +
              '  ' +
              error?.error?.responseObject +
              '  ' +
              error.status +
              '  ' +
              error?.error?.statusMessage;
            this.toast.show(
              '',
              msg,
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          } else if (
            !error?.error?.statusMessage &&
            !error?.error?.responseObject &&
            !skipToast
          ) {
            const msg =
              error.statusText +
              '  ' +
              error.status +
              '  ' +
              error?.error?.statusMessage;
            this.toast.show(
              '',
              msg,
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          } else if (
            (error?.error?.statusDescription ||
              error.error?.error_description) &&
            !skipToast
          ) {
            const msg =
              error?.error?.statusDescription ||
              error.error?.error_description + '---' + error.status;

            this.toast.show(
              error.statusText,
              msg,
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          }
          // else if (error.message && !skipToast) {
          //     const msg = error.message;
          //     this.toast.show(error.statusText, msg, MessageBoxType.DANGER, 5000, undefined, undefined, false);
          // }
          else if (!skipToast) {
            this.toast.show(
              error.statusText,
              this.getErrorMessage(error),
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          }
          const err = error?.error?.message || error?.statusText;
        }
        return throwError(() => error);
      })
    );
  }

  badRequestExceptionHandler() {
    return false;
  }

  getErrorMessage = (error: HttpErrorResponse) => {
    try {
      return (
        error.statusText +
        '-' +
        error.error.responseObject[0].errors[0] +
        '-' +
        error.error.statusMessage +
        '-' +
        error.status
      );
    } catch (e) {
      return error?.status + error.error.responseObject[0].errors[0];
    } finally {
      return this.translate.instant('ERRORS.UNKNOWN-ERROR');
    }
  };

  private handlerError(errorNumber: number, error?: any) {
    let title!: any;
    let message!: any;
    let btnName!: any;
    switch (errorNumber) {
      case 401:
        btnName = 'LOGIN.COMMON.SIGN-IN';
        title = this.translate.instant('LOGIN.COMMON.UNAUTHORIZED');
        message = this.translate.instant('LOGIN.COMMON.REQUEST-UNAUTHORIZED');
        this.toast.show(
          title,
          message,
          MessageBoxType.DANGER,
          50000,
          btnName,
          this.logoutCallback,
          false
        );
        break;
      case 400:

      case 403:
        btnName = this.translate.instant('LOGIN.COMMON.SIGN-IN');
        title = this.translate.instant('LOGIN.COMMON.FORBIDDEN');
        message = this.translate.instant('LOGIN.COMMON.REQUEST-FORBIDDEN');
        this.toast.show(title, message, MessageBoxType.DANGER, 10000);
        this.toast.show(
          title,
          message,
          MessageBoxType.DANGER,
          50000,
          undefined,
          undefined,
          false
        );
        break;
      case 500:
        title = this.translate.instant('ERRORS.SERVER-ERROR');
        message = this.translate.instant('ERRORS.SERVER-ERROR-TEXT');
        if (error?.error?.statusMessage && !error?.error?.responseObject) {
          const msg = error.statusText + '---' + error.status;
          this.toast.show(
            error?.error?.statusMessage,
            msg,
            MessageBoxType.DANGER
          );
          this.toast.show(
            error?.error?.statusMessage,
            msg,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        }
        break;
      default:
        break;
    }
  }

  logoutCallback = () => {
    const location = window.location;
    this.session.setUrlParameter(this.router.routerState.snapshot.url);
    if (!this.session.isLoggedIn()) return location.reload();
    this.session.logout().subscribe(() => this.session.login(null, '1'));
  };
}
