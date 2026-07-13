import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoaderService } from '../../modules/loader';
import { environment as env } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionLogoutService {
  constructor(
    private http: HttpClient,
    private loader: LoaderService
  ) {}

  logout(options: {
    token: string | undefined;
    onFinalize: () => void;
  }): Observable<unknown> {
    console.log('[BSH.SessionService] logout — token exists:', !!options.token);
    this.loader.isLoading.next(true);

    return this.http
      .post(
        `${env.apiUrl}/adminportalauth/api/authorization/logout`,
        {},
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${options.token}`,
          }),
        }
      )
      .pipe(
        finalize(() => {
          options.onFinalize();
          this.loader.isLoading.next(false);
        })
      );
  }
}
