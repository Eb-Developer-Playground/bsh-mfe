import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isDev, isUat } from '../utils';
import { environment as env } from '../../../environments/environment';

export interface IHttpOptions {
  host?: string;
  headers?: {};
  queryParams?: {};
  skipProxy?: boolean;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private translation: TranslateService
  ) {}

  getHeaders(headers: {}): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      'Accept-Language': this.languageFilter() || 'en-GB',
      ...headers,
    });
  }

  languageFilter = (): string => {
    if (this.translation.currentLang === 'fr-CD') return 'fr';

    if (this.translation.currentLang === 'en-GB') return 'en';

    return this.translation.currentLang;
  };

  getUrl(path: string, options?: IHttpOptions) {
    const parts = path.split('?');
    const url = new URL(options && options?.host ? options?.host : env.apiUrl);
    const urlParams = new URLSearchParams(parts?.[1] || '').toString();
    const additionalParams = new URLSearchParams(
      options?.queryParams || {}
    ).toString();
    url.search = new URLSearchParams(
      additionalParams + urlParams !== '' ? `&${urlParams}` : ''
    ).toString();
    url.pathname =
      !options?.skipProxy && (isDev() || isUat()) && window.location.port === ''
        ? `/v1/bsh${parts[0]}`
        : parts[0];
    return url.toString();
  }

  public list<T>(path: string, options?: IHttpOptions): Observable<T> {
    /**
     * Get all objects of type T from a provided url endpoint.
     * @url: api endpoint.
     * @return: Observable for consumers to subscribe to.
     */
    return this.http
      .get<T>(`${this.getUrl(path, options)}`, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public listResponse<T>(
    path: string,
    options?: IHttpOptions
  ): Observable<{ body: T[]; headers: HttpHeaders }> {
    return this.http
      .get<any>(`${this.getUrl(path, options)}`, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
        observe: 'response',
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public listWithProgress<T>(
    path: string,
    options?: IHttpOptions
  ): Observable<HttpEvent<{}>> {
    const request = new HttpRequest(
      'GET',
      `${this.getUrl(path, options)}`,
      {},
      { reportProgress: true, headers: this.getHeaders(options?.headers || {}) }
    );
    return this.http.request(request);
  }

  public get<T>(path: string, options?: IHttpOptions): Observable<T> {
    /**
     * Get an object(s) from the database.
     * @url: api endpoint.
     * @return Observable for consumers to subscribe to.
     */
    return this.http
      .get<T>(`${this.getUrl(path, options)}`, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  /**
   * function to handle blob objects
   * @return Observable blob for consumers to subscribe to.
   * */

  public getBlob(path: string, options?: IHttpOptions): Observable<Blob> {
    return this.http.get(`${this.getUrl(path, options)}`, {
      headers: this.getHeaders(options?.headers || {}),
      params: options?.queryParams || {},
      responseType: 'blob',
    });
  }

  public fetch<T>(path: string, options?: IHttpOptions): Observable<T> {
    /**
     * Get an object from database.
     * @url: api endpoint.
     * @id: database id of item.
     * @return Observable for consumers to subscribe to.
     */
    return this.get(path, options);
  }

  public retrieve<T>(
    path: string,
    id: string,
    options?: IHttpOptions
  ): Observable<T> {
    /**
     * Get an object from the database.
     * @url: api endpoint.
     * @id: database id of item.
     * @return Observable for consumers to subscribe to.
     */
    return this.get(`${path}${id}/`, options);
  }

  public create<T>(
    path: string,
    object: T,
    options?: IHttpOptions
  ): Observable<T> {
    /**
     * Create a Generic object T.
     * @return Observable for consumers to subscribe to.
     */
    return this.http
      .post<T>(`${this.getUrl(path, options)}`, object, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public post<T>(path: string, data: T, options?: IHttpOptions): Observable<T> {
    /**
     * Same as create
     */
    return this.create(path, data, options);
  }

  public postBlob(
    path: string,
    data: any,
    options?: IHttpOptions
  ): Observable<any> {
    return this.http.post<any>(`${this.getUrl(path, options)}`, data, {
      responseType: 'blob' as 'json',
    });
  }

  public postWithProgress<T>(
    path: string,
    data?: any,
    options?: IHttpOptions
  ): Observable<HttpEvent<{}>> {
    const request = new HttpRequest(
      'POST',
      `${this.getUrl(path, options)}`,
      data,
      {
        reportProgress: true,
        headers: this.getHeaders(options?.headers || {}),
        params: new HttpParams({ fromObject: options?.queryParams || {} }),
      }
    );
    return this.http.request(request);
  }

  public put<T>(
    path: string,
    id: string,
    data: T,
    options?: IHttpOptions
  ): Observable<T> {
    /**
     * Update a database object.
     * @url: api endpoint for the collections.
     * @id: database id of item to be updated.
     * @new_object: the new object instance.
     * @return Observable for consumers to subscribe to.
     */
    return this.http
      .put<any>(`${this.getUrl(path, options)}${id}/`, data, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public patch<T>(
    path: string,
    id: string,
    data: T,
    options?: IHttpOptions
  ): Observable<T> {
    /**
     * Partially update a database object.
     * @url: api endpoint for the collections.
     * @id: database id of item to be updated.
     * @new_object: the new object instance.
     * @return Observable for consumers to subscribe to.
     */
    return this.http
      .patch<any>(`${this.getUrl(path, options)}${id}/`, data, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public delete<T>(
    path: string,
    id: string,
    options?: IHttpOptions
  ): Observable<T> {
    /**
     * Remove object from database.
     * @url: api endpoint.
     * @id: db ID of object to delete.
     */
    return this.http
      .delete<T>(`${this.getUrl(path, options)}${id}/`, {
        headers: this.getHeaders(options?.headers || {}),
        params: options?.queryParams || {},
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  public uploadFormData<T>(
    path: string,
    data: FormData,
    method: 'post' | 'put' | 'patch' = 'post',
    options?: IHttpOptions
  ): any {
    if (method === 'post') {
      return this.http
        .post(`${this.getUrl(path, options)}`, data, {
          headers: this.getHeaders(options?.headers || {}),
        })
        .pipe(catchError(err => throwError(() => err)));
    } else if (method === 'put') {
      return this.http
        .put(`${this.getUrl(path, options)}`, data, {
          headers: this.getHeaders(options?.headers || {}),
        })
        .pipe(catchError(err => throwError(() => err)));
    } else {
      return this.http
        .patch(`${this.getUrl(path, options)}`, data, {
          headers: this.getHeaders(options?.headers || {}),
        })
        .pipe(catchError(err => throwError(() => err)));
    }
  }
}
