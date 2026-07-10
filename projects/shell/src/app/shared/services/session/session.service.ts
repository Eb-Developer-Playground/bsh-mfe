import { Injectable, inject, signal, Signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { toObservable } from '@angular/core/rxjs-interop';

import { finalize, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { EncryptionService } from '../encryption.service';
import { LoaderService } from '../../modules/loader';
import { ILocale } from '../../modules/localization';
import { TimeoutDialog } from '../../dialogs';
import { AUTH_VERSION, User } from '../../models';
import { default as SUBSIDIARIES } from '../../../../assets/data/subsidiaries.json';
import { default as LOCALES } from '../../../../assets/data/language-locales.json';
import { environment as env } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';

export type IActionFlow = string;
export type IActionFlowStatus = string | null;

export interface IUserPermission {
  name: string;
  permissionType?: string;
  actionFlows?: IActionFlow[];
  statuses?: IActionFlowStatus[] | null;
}

export interface IUserRole {
  name: string;
  level: string;
  permissions: IUserPermission[];
}

export interface ILoginResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

export interface ISubsidiary {
  bankId: any;
  countryCode: string;
  countryName: string;
  currency?: string;
  currencySymbol?: string;
  nationality: string;
  dialCode: string;
  icon: string;
  flagPath: string;
  operatingCountry: boolean;
  countryCode3Chars?: string;
  languages: ILocale[];
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  updatingSession!: boolean;
  dialogRef!: MatDialogRef<any> | undefined;
  _roles!: IUserRole[];

  private _user = signal<User | undefined>(undefined);
  private _isActive!: WritableSignal<boolean>;
  private _onChanged!: WritableSignal<boolean>;

  get user(): User {
    return this._user()!;
  }

  /** Backward-compat Observable-based API */
  readonly isActive$: Observable<boolean>;
  readonly onChanged$: Observable<boolean>;

  /** New signal-based API */
  isActiveSignal!: Signal<boolean>;
  onChangedSignal!: Signal<boolean>;

  get isActive(): Observable<boolean> {
    return this.isActive$;
  }

  get onChanged(): Observable<boolean> {
    return this.onChanged$;
  }

  get subsidiary(): ISubsidiary {
    if (this.isLoggedIn()) {
      const config = SUBSIDIARIES.responseObject.find(
        sub => sub.bankId == this.userBank
      );
      return <ISubsidiary>{
        ...config,
        operatingCountry: false,
        countryCode3Chars: '',
        languages: <ILocale[]>config?.languages.map(lang => {
          const loc = LOCALES.find(l => l.id === lang);
          return { id: loc?.id, name: loc?.name };
        }),
      };
    }
    return {
      bankId: '',
      countryCode: '',
      countryName: '',
      currency: '',
      currencySymbol: '',
      nationality: '',
      dialCode: '',
      icon: '',
      flagPath: '',
      operatingCountry: false,
      countryCode3Chars: '',
      languages: [],
    };
  }

  get authVersion(): any {
    return this.user?.version || AUTH_VERSION.VERSION_1;
  }

  get reissueToken(): string {
    return this.user?.reissue;
  }

  set roles(data: IUserRole[]) {
    this._roles = data;
    // localStorage.setItem("roles", JSON.stringify(data));
  }

  get roles(): IUserRole[] {
    return this._roles;
    // return JSON.parse(<string>localStorage.getItem("roles"));
  }

  get permissions(): IUserPermission[] {
    if (!this.isLoggedIn()) return [];
    let permissions: IUserPermission[] = [];
    if (this.authVersion === AUTH_VERSION.VERSION_1) {
      permissions = this.user.role.map(r => {
        return { name: r, actionFlows: [], statuses: [] };
      });
    } else if (this.authVersion === AUTH_VERSION.VERSION_2) {
      permissions = this.roles
        .map(r => r.permissions)
        .reduce((acc, cur) => [...acc, ...cur], []);
    }
    return permissions.sort((a, b) => a.name.localeCompare(b.name));
  }

  get actionFlows(): IActionFlow[] {
    if (!this.isLoggedIn()) return [];
    return this.permissions
      .map(r => r?.actionFlows || [])
      .reduce((acc, cur) => [...acc, ...cur], [])
      .sort((a, b) => a.localeCompare(b));
  }

  set expiresAt(m: moment.Moment) {
    this.encryptItem('expires_at', JSON.stringify(m.valueOf()));
  }

  get expiresAt(): moment.Moment {
    return JSON.parse(this.decryptItem('expires_at') || 'null');
  }

  set syncToken(token: string | undefined) {
    this.encryptItem('syncRt', token || '');
  }

  get syncToken(): string | undefined {
    return this.decryptItem('syncRt') || '';
  }

  set loginResponse(resp: ILoginResponse) {
    this.encryptItem('access_token', JSON.stringify(resp));
  }

  get loginResponse(): ILoginResponse {
    return JSON.parse(this.decryptItem('access_token') || 'null');
  }

  get userEmail(): string {
    if (this.isLoggedIn()) return this.user.username.toLowerCase();
    return '';
  }

  get userFullName(): string {
    if (this.isLoggedIn()) {
      return this.user.username.split('@')[0].split('.').join(' ');
    }
    return '';
  }

  get userInitials(): string {
    if (this.isLoggedIn()) {
      return this.userFullName
        .split(' ')
        .map(n => n.charAt(0).toUpperCase())
        .join('');
    }
    return '';
  }

  get userWorkClass(): string {
    if (this.isLoggedIn()) return this.user.workingClass;
    return '';
  }

  get userCountryCode(): string {
    if (this.isLoggedIn()) return this.user.countryId;
    return '';
  }

  get userBranch(): string {
    if (this.isLoggedIn()) return this.user.branchid;
    return '';
  }

  get userAud(): string[] {
    if (this.isLoggedIn()) return this.user.aud;
    return [];
  }

  get userBank(): string {
    if (this.isLoggedIn()) return this.user.bankId;
    return '';
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private loader: LoaderService
    // private accountSelectionService: AccountSelectionService
  ) {
    this._isActive = signal(false);
    this._onChanged = signal(false);
    this.isActiveSignal = this._isActive.asReadonly();
    this.onChangedSignal = this._onChanged.asReadonly();
    this.isActive$ = toObservable(this._isActive);
    this.onChanged$ = toObservable(this._onChanged);
    this.encryptionService = inject(EncryptionService);
    this.setSession();
    const hasToken = !!localStorage.getItem('access_token');
    console.log('[BSH.SessionService] constructed | encrypted token in storage:', hasToken, '| loggedIn:', this.isLoggedIn(), '| signal.active:', this._isActive());
  }

  private encryptionService!: EncryptionService;

  /** Encrypt and store a value in localStorage */
  private encryptItem(key: string, value: string): void {
    localStorage.setItem(key, this.encryptionService.encryptAES(value));
  }

  /** Read and decrypt from localStorage with fallback for legacy unencrypted data */
  private decryptItem(key: string): string | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const decrypted = this.encryptionService.decryptAES(raw);
    if (decrypted === 'error 1' || decrypted === 'error 2' || decrypted === 'error 3') {
      return raw;
    }
    return decrypted;
  }

  /** Public API for external services to signal that session state changed */
  public notifyChanged(active: boolean = this._isActive()): void {
    this._onChanged.set(active);
    this._isActive.set(active);
  }

  public decodeToken(token: string): any {
    return jwtDecode(token);
  }

  public get currentUser(): any {
    const decoded = this.decodeToken(this.loginResponse.access_token);
    this._user.set(decoded);
    return decoded;
  }

  // NOTE: loginResponse to be passed immediately after session retrieval
  public setSession(loginResponse?: any) {
    if (loginResponse) {
      console.log('[BSH.SessionService] setSession called with new loginResponse | expires_in:', loginResponse.expires_in);
      this.loginResponse = loginResponse;
      this.expiresAt = moment().add(loginResponse.expires_in, 'second');
    }
    if (this.loginResponse) {
      this._user.set(jwtDecode(this.loginResponse.access_token));
      localStorage.setItem('bankId', this.user?.bankId);
      const active = this.isLoggedIn();
      console.log('[BSH.SessionService] setSession complete | user:', this.user?.sub, '| bankId:', this.user?.bankId, '| isLoggedIn:', active, '| expiresAt:', this.expiresAt?.format());
      this._isActive.set(active);
      this._onChanged.set(active);
    } else {
      console.log('[BSH.SessionService] setSession — no loginResponse in storage, user is not authenticated');
    }
  }

  public isLoggedIn() {
    return this.loginResponse ? moment().isBefore(this.expiresAt) : false;
  }

  public isExpired(): boolean {
    return !this.isLoggedIn();
  }

  public getRoles(): string[] {
    return this.isLoggedIn() ? this.user.role : [];
  }

  public hasRole(role: any): boolean {
    if (!this.isLoggedIn()) return false;
    return this.getRoles()?.includes(role);
  }

  public hasPermission(permission: string): boolean {
    if (!this.isLoggedIn()) return false;
    return this.permissions.some(p => p.name === permission);
  }

  public hasMarkerPermission(permission: string): boolean {
    if (!this.isLoggedIn()) return false;
    return this.permissions.some(
      p => p.name === permission && p.permissionType === 'Maker'
    );
  }

  public hasCheckerPermission(permission: string): boolean {
    if (!this.isLoggedIn()) return false;
    return this.permissions.some(
      p => p.name === permission && p.permissionType === 'Checker'
    );
  }

  public hasFeatureRole$(roleName: string): Observable<boolean> {
    const url = new URL(env.apiUrl);
    url.pathname = '/adminportalauth/api/userinfo/oldrole';
    url.searchParams.set('role', roleName);
    return this.http.get<boolean>(`${url}`, {
      headers: new HttpHeaders({
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.loginResponse.access_token,
      }),
    });
  }

  public isMakerForProcess(process: string): boolean {
    if (!this.isLoggedIn() || this.authVersion !== '2') return false;
    const perm = this.permissions.find(p => p.permissionType === 'Maker');
    return perm?.actionFlows?.includes(process) || false;
  }

  public isCheckerForProcess(process: string): boolean {
    if (!this.isLoggedIn() || this.authVersion !== '2') return false;
    const perm = this.permissions.find(p => p.permissionType === 'Checker');
    return perm?.actionFlows?.includes(process) || false;
  }

  public hasPermissionForProcess(permission: string, process: string): boolean {
    if (!this.isLoggedIn() || this.authVersion !== '2') return false;
    const perm = this.permissions.find(p => p.name === permission);
    return perm?.actionFlows?.includes(process) || false;
  }

  public hasMakerPermissionForProcess(
    permission: string,
    process: string
  ): boolean {
    if (!this.isLoggedIn() || this.authVersion !== '2') return false;
    const perm = this.permissions.find(
      p => p.name === permission && p.permissionType === 'Maker'
    );
    return perm?.actionFlows?.includes(process) || false;
  }

  public hasCheckerPermissionForProcess(
    permission: string,
    process: string
  ): boolean {
    if (!this.isLoggedIn() || this.authVersion !== '2') return false;
    const perm = this.permissions.find(
      p => p.name === permission && p.permissionType === 'Checker'
    );
    return perm?.actionFlows?.includes(process) || false;
  }

  public updateFeatureRoles(roles: any[]): void {
    if (this.user) Object.assign(this.user, { featureRoles: roles });
  }

  public getFeatureRoles(): any[] {
    return this.isLoggedIn() ? this.user.featureRoles : [];
  }

  public hasFeatureRole(role: string): boolean {
    // If not logged in or don't have role attribute return with false
    if (!this.isLoggedIn()) {
      return false;
    }
    return this.user.featureRoles?.some(
      r =>
        r.name.toLowerCase() === role.toLowerCase() && r.visible && !r.disabled
    );
  }
  public hasFeatureFlag(feature: any, environment: string): boolean {
    // If not logged in or don't have role attribute return with false
    if (!this.isLoggedIn()) {
      return false;
    }

    // console.log(feature?.activate?.environment)
    return feature?.activate?.environment;
  }

  public setUrlParameter(url: string) {
    localStorage.setItem('returnUrl', JSON.stringify(url));
  }

  public getUrlParameters() {
    try {
      return JSON.parse(localStorage.getItem('returnUrl') || 'false');
    } catch (e) {}
    return null;
  }

  public removeUrlParameters(): void {
    localStorage.removeItem('returnUrl');
  }

  public showInactivityCountdown(): void {
    if (this.dialogRef || !this.isLoggedIn()) return;
    this.dialogRef = this.dialog.open(TimeoutDialog, {
      width: '25rem',
      disableClose: true,
      data: {},
    });
    this.dialogRef.afterClosed().subscribe((result: any) => {
      this.dialogRef = undefined;
      if (result.logout) {
        const bankId = this.user.bankId;
        this.logout().subscribe(() => {
          this.setUrlParameter(this.router.routerState.snapshot.url);
          this.login(null, '1', bankId);
        });
      }
    });
  }

  logout() {
    const token = this.loginResponse?.access_token;
    console.log('[BSH.SessionService] logout — token exists:', !!token);
    this.loader.isLoading.next(true);
    return this.http
      .post(
          `${env.apiUrl}/adminportalauth/api/authorization/logout`,
          {},
          {headers: new HttpHeaders({"Authorization": `Bearer ${token}`})}
      )
      .pipe(
        finalize(() => {
          console.log('[BSH.SessionService] logout finalize — clearing storage');
          localStorage.removeItem('expires_at');
          localStorage.removeItem('access_token');
          localStorage.removeItem('syncRt');
          this._user.set(undefined);
          this._isActive.set(false);
          this._onChanged.set(false);
          this.loader.isLoading.next(false);
          console.log('[BSH.SessionService] logout complete — signal.active:', this._isActive(), 'storage cleared');
        })
      );
  }

  login(returnPath?: any, reAuth?: any, bankId?: string) {
    const returnUrl = returnPath || this.getUrlParameters() || '/dashboard';
    const locale = JSON.parse(
      localStorage.getItem('user-locale') || '{"language":"en-GB"}'
    );
    const host = window.location.port
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : `${window.location.protocol}//${window.location.hostname}`;
    if (!bankId)
      bankId = localStorage.getItem('bankId') || '';
    const redirectUrl = `${(env as any).adminPortalUrl}/login/login/?returnUrl=${encodeURIComponent(host + returnUrl)}&lang=${locale?.language}&bankId=${bankId || ''}&re-auth=${reAuth || 0}`;
    console.log('[BSH.SessionService] login — redirecting to admin portal:', redirectUrl.substring(0, 120) + '...');
    const params = new URLSearchParams();
    params.set('re-auth', `${reAuth || 0}`);
    params.set('returnUrl', host + returnUrl);
    params.set('lang', locale?.language);
    params.set('bankId', bankId || '');
    window.location.replace(
      `${(env as any).adminPortalUrl}/login/login/?${params.toString()}`
    );
  }

  updateSession(
    reIssue?: string,
    bankId?: any,
    showLoader = true
  ): Observable<any> {
    if (this.updatingSession) {
      console.log('[BSH.SessionService] updateSession — already updating, skipping');
      return of(true);
    }
    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (!showLoader) headers['skipLoadingInterceptor'] = 'true';
    const body = new HttpParams({
      fromObject: {
        grant_type: 'reissue_token',
        code: reIssue || this.user.reissue,
        bankId: bankId,
      },
    });
    this.updatingSession = true;
    const targetUrl = `${env.apiUrl}/adminportalauth/oauth/microsoft`;
    console.log('[BSH.SessionService] updateSession — POST', targetUrl, '| bankId:', bankId, '| reIssue length:', reIssue?.length || 0);
    return this.http
      .post(targetUrl, body.toString(), {
        headers: new HttpHeaders(headers),
      })
      .pipe(
        map(r => {
          const resp = r as any;
          console.log('[BSH.SessionService] updateSession SUCCESS | expires_in:', resp?.expires_in, '| token present:', !!resp?.access_token);
          this.syncToken = reIssue;
          this.setSession(r);
          const loggedIn = this.isLoggedIn();
          console.log('[BSH.SessionService] updateSession result — isLoggedIn:', loggedIn);
          return loggedIn;
        }),
        shareReplay(),
        finalize(() => {
          this.updatingSession = false;
          console.log('[BSH.SessionService] updateSession finalize — updatingSession set to false');
        })
      );
  }

  routeToUrl(url: string | URL) {
    let lang = '';
    const localeRaw = localStorage.getItem('user-locale');
    if (localeRaw)
      lang = JSON.parse(localeRaw).language;
    const parts = url.toString().split('?');
    const params = parts?.[1] || '';
    const rtParams = new URLSearchParams({
      rt: this.reissueToken,
      bankId: this.userBank,
      lang: lang,
    });
    const toUrl = new URL(parts?.[0]);
    toUrl.search = new URLSearchParams(
      `${rtParams.toString()}&${params}`
    ).toString();
    console.log('[BSH.SessionService] routeToUrl — navigating to:', toUrl.toString().substring(0, 120) + '...', '| rt present:', !!this.reissueToken, '| bankId:', this.userBank);
    localStorage.removeItem('expires_at');
    localStorage.removeItem('access_token');
    console.log('[BSH.SessionService] routeToUrl — cleared local storage, redirecting');
    window.location.replace(toUrl);
  }

  //digital support user
  isDigitalSupportUser = (): boolean => {
    return (
      this.hasFeatureRole('AccountManagement.ViewWithReason') &&
      this.hasRole('AccountManagement.EfrontUser')
    );
  };
}
