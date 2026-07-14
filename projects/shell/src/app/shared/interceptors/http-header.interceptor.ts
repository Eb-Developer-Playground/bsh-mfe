import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '@app/shared/services/session/session.service';
import { environment } from '../../../environments/environment.uat';

@Injectable()
export class HttpHeaderInterceptor implements HttpInterceptor {
  constructor(private sessionService: SessionService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isApiUrl = req.url.startsWith(environment.secugenApi);
    if (
      !isApiUrl &&
      !this.sessionService.isExpired() &&
      !req.url.includes('assets/icons') &&
      !req.url.includes('./assets/') &&
      !req.url.includes('www.randomlists.com/data/names')
    ) {
      req = req.clone({
        headers: req.headers.set(
          'Authorization',
          'Bearer ' + this.sessionService.loginResponse.access_token
        ),
      });
    }
    return next.handle(req);
  }
}
