import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../modules/loader';

/**
 *   An array requests of type HttpRequests will be created.
 *   Whenever a new Http call hits, it will be pushed in it.
 *   On successfully completing the Http call, that request
 *
 */

@Injectable({
  providedIn: 'root',
})
export class LoaderInterceptor implements HttpInterceptor {
  private countRequest = 0;
  private loaderService = inject(LoaderService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (request.headers.get('skipLoadingInterceptor'))
      return next.handle(request);

    if (!this.countRequest) {
      this.loaderService.isLoading.next(true);
    }

    this.countRequest++;
    return next.handle(request).pipe(
      finalize(() => {
        this.countRequest--;
        if (!this.countRequest) {
          this.loaderService.isLoading.next(false);
        }
      })
    );
  }
}
