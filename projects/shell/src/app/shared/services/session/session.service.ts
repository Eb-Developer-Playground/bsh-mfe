import { Injectable, inject, signal, Signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';

import { finalize, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ILocale } from '../../modules/localization';
import { AUTH_VERSION, User } from '../../models';
import { AuthStatePublisherService } from '../../equity-auth/auth-state-publisher.service';
import { SessionStorageService } from './session-storage.service';
import { SessionTokenDecoderService } from './session-token-decoder.service';
import { SessionAuthTransitionService } from './session-auth-transition.service';
import { SessionAuthorizationService } from './session-authorization.service';
import { SessionNavigationService } from './session-navigation.service';
import { SessionInactivityService } from './session-inactivity.service';
import { SessionProfileProjectionService } from './session-profile-projection.service';
import { SessionLogoutService } from './session-logout.service';
import { addSeconds, isBefore } from 'date-fns';
import { environment as env } from '../../../../environments/environment';


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
  _roles!: IUserRole[];

  private _user = signal<User | undefined>(undefined);
  private _isActive!: WritableSignal<boolean>;
  private _onChanged!: WritableSignal<boolean>;
  private authStatePublisher = inject(AuthStatePublisherService);
  private sessionStorage = inject(SessionStorageService);
  private sessionTokenDecoder = inject(SessionTokenDecoderService);
  private sessionAuthTransition = inject(SessionAuthTransitionService);
  private sessionAuthorization = inject(SessionAuthorizationService);
  private sessionNavigation = inject(SessionNavigationService);
  private sessionInactivity = inject(SessionInactivityService);
  private sessionProfileProjection = inject(SessionProfileProjectionService);
  private sessionLogout = inject(SessionLogoutService);

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
    return this.sessionProfileProjection.getSubsidiary(
      this.isLoggedIn(),
      this.userBank
    );
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
    return this.sessionAuthorization.getPermissions(
      this.isLoggedIn(),
      this.authVersion,
      this._user(),
      this.roles || []
    );
  }

  get actionFlows(): IActionFlow[] {
    return this.sessionAuthorization.getActionFlows(
      this.isLoggedIn(),
      this.permissions
    );
  }

  set expiresAt(ts: number) {
    this.sessionStorage.setEncryptedItem('expires_at', JSON.stringify(ts));
  }

  get expiresAt(): number | null {
    return JSON.parse(this.sessionStorage.getDecryptedItem('expires_at') || 'null');
  }

  set syncToken(token: string | undefined) {
    this.sessionStorage.setEncryptedItem('syncRt', token || '');
  }

  get syncToken(): string | undefined {
    return this.sessionStorage.getDecryptedItem('syncRt') || '';
  }

  set loginResponse(resp: ILoginResponse) {
    this.sessionStorage.setEncryptedItem('access_token', JSON.stringify(resp));
  }

  get loginResponse(): ILoginResponse {
    return JSON.parse(this.sessionStorage.getDecryptedItem('access_token') || 'null');
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
    private http: HttpClient
    // private accountSelectionService: AccountSelectionService
  ) {
    this._isActive = signal(false);
    this._onChanged = signal(false);
    this.isActiveSignal = this._isActive.asReadonly();
    this.onChangedSignal = this._onChanged.asReadonly();
    this.isActive$ = toObservable(this._isActive);
    this.onChanged$ = toObservable(this._onChanged);
    this.setSession();
    const hasToken = this.sessionStorage.hasItem('access_token');
    console.log('[BSH.SessionService] constructed | encrypted token in storage:', hasToken, '| loggedIn:', this.isLoggedIn(), '| signal.active:', this._isActive());
  }

  /** Public API for external services to signal that session state changed */
  public notifyChanged(active: boolean = this._isActive()): void {
    this._onChanged.set(active);
    this._isActive.set(active);
    this.publishAuthState();
  }

  public decodeToken(token: string): User {
    return this.sessionTokenDecoder.decodeUser(token);
  }

  public get currentUser(): User {
    const decoded = this.decodeToken(this.loginResponse.access_token);
    this._user.set(decoded);
    return decoded;
  }

  // NOTE: loginResponse to be passed immediately after session retrieval
  public setSession(loginResponse?: ILoginResponse) {
    if (loginResponse) {
      console.log('[BSH.SessionService] setSession called with new loginResponse | expires_in:', loginResponse.expires_in);
      this.loginResponse = loginResponse;
      this.expiresAt = addSeconds(Date.now(), loginResponse.expires_in).getTime();
    }

    const transition = this.sessionAuthTransition.restoreSession(
      this.loginResponse,
      this.isLoggedIn(),
      this.currentLanguage,
      this.expiresAtValue
    );

    if (!transition.user) {
      console.log('[BSH.SessionService] setSession — no loginResponse in storage, user is not authenticated');
      this._user.set(undefined);
      this._isActive.set(false);
      this._onChanged.set(false);
      this.authStatePublisher.publish(transition.authState);
      return;
    }

    this._user.set(transition.user);
    if (transition.bankId) {
      localStorage.setItem('bankId', transition.bankId);
    }
    console.log('[BSH.SessionService] setSession complete | user:', transition.user.sub, '| bankId:', transition.user.bankId, '| isLoggedIn:', transition.active, '| expiresAt:', this.expiresAt ? new Date(this.expiresAt).toISOString() : null);
    this._isActive.set(transition.active);
    this._onChanged.set(transition.active);
    this.authStatePublisher.publish(transition.authState);
  }

  public isLoggedIn() {
    return this.loginResponse ? isBefore(Date.now(), this.expiresAt!) : false;
  }

  public isExpired(): boolean {
    return !this.isLoggedIn();
  }

  public getRoles(): string[] {
    return this.sessionAuthorization.getRoles(this.isLoggedIn(), this._user());
  }

  public hasRole(role: string): boolean {
    return this.sessionAuthorization.hasRole(
      this.isLoggedIn(),
      this.getRoles(),
      role
    );
  }

  public hasPermission(permission: string): boolean {
    return this.sessionAuthorization.hasPermission(
      this.isLoggedIn(),
      this.permissions,
      permission
    );
  }

  public hasMarkerPermission(permission: string): boolean {
    return this.sessionAuthorization.hasPermission(
      this.isLoggedIn(),
      this.permissions,
      permission,
      'Maker'
    );
  }

  public hasCheckerPermission(permission: string): boolean {
    return this.sessionAuthorization.hasPermission(
      this.isLoggedIn(),
      this.permissions,
      permission,
      'Checker'
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
    return this.sessionAuthorization.hasProcessPermission(
      this.isLoggedIn(),
      this.authVersion,
      this.permissions,
      process,
      undefined,
      'Maker'
    );
  }

  public isCheckerForProcess(process: string): boolean {
    return this.sessionAuthorization.hasProcessPermission(
      this.isLoggedIn(),
      this.authVersion,
      this.permissions,
      process,
      undefined,
      'Checker'
    );
  }

  public hasPermissionForProcess(permission: string, process: string): boolean {
    return this.sessionAuthorization.hasProcessPermission(
      this.isLoggedIn(),
      this.authVersion,
      this.permissions,
      process,
      permission
    );
  }

  public hasMakerPermissionForProcess(
    permission: string,
    process: string
  ): boolean {
    return this.sessionAuthorization.hasProcessPermission(
      this.isLoggedIn(),
      this.authVersion,
      this.permissions,
      process,
      permission,
      'Maker'
    );
  }

  public hasCheckerPermissionForProcess(
    permission: string,
    process: string
  ): boolean {
    return this.sessionAuthorization.hasProcessPermission(
      this.isLoggedIn(),
      this.authVersion,
      this.permissions,
      process,
      permission,
      'Checker'
    );
  }

  public updateFeatureRoles(roles: any[]): void {
    if (this.user) Object.assign(this.user, { featureRoles: roles });
  }

  public getFeatureRoles(): any[] {
    return this.isLoggedIn() ? this.user.featureRoles : [];
  }

  public hasFeatureRole(role: string): boolean {
    return this.sessionAuthorization.hasFeatureRole(
      this.isLoggedIn(),
      this._user()?.featureRoles,
      role
    );
  }
  public hasFeatureFlag(feature: any, _environment: string): boolean {

    return this.sessionAuthorization.hasFeatureFlag(
      this.isLoggedIn(),
      feature
    );
  }

  public setUrlParameter(url: string) {
    this.sessionNavigation.setReturnUrl(url);
  }

  public getUrlParameters() {
    return this.sessionNavigation.getReturnUrl();
  }

  public removeUrlParameters(): void {
    this.sessionNavigation.removeReturnUrl();
  }

  public showInactivityCountdown(): void {
    this.sessionInactivity.showCountdown({
      isLoggedIn: this.isLoggedIn(),
      currentBankId: this.user.bankId,
      currentUrl: window.location.pathname + window.location.search,
      logout: () => this.logout(),
      onReloginRequired: (returnUrl, bankId) => {
        this.setUrlParameter(returnUrl);
        this.login(null, '1', bankId);
      },
    });
  }

  logout() {
    return this.sessionLogout.logout({
      token: this.loginResponse?.access_token,
      onFinalize: () => {
        console.log('[BSH.SessionService] logout finalize — clearing storage');
        this.sessionStorage.clearSessionTokens();
        this._user.set(undefined);
        this._isActive.set(false);
        this._onChanged.set(false);
        this.publishAuthState();
        console.log('[BSH.SessionService] logout complete — signal.active:', this._isActive(), 'storage cleared');
      },
    });
  }

  login(returnPath?: string | null, reAuth?: string | null, bankId?: string) {
    this.sessionNavigation.login(returnPath, reAuth, bankId);
  }

  updateSession(
    reIssue?: string,
    bankId?: any,
    showLoader = true
  ): Observable<boolean> {
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
      .post<ILoginResponse>(targetUrl, body.toString(), {
        headers: new HttpHeaders(headers),
      })
      .pipe(
        map(response => {
          console.log('[BSH.SessionService] updateSession SUCCESS | expires_in:', response.expires_in, '| token present:', !!response.access_token);
          this.syncToken = reIssue;
          this.setSession(response);
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
    this.sessionNavigation.routeToUrl(url, this.reissueToken, this.userBank);
  }

  //digital support user
  isDigitalSupportUser = (): boolean => {
    return this.sessionAuthorization.isDigitalSupportUser(
      this.isLoggedIn(),
      this._user()?.featureRoles,
      this.getRoles()
    );
  };

  private publishAuthState(): void {
    this.authStatePublisher.publish(
      this.sessionAuthTransition.buildAuthState({
        loginResponse: this.loginResponse,
        isLoggedIn: this.isLoggedIn(),
        user: this._user(),
        language: this.currentLanguage,
        expiresAt: this.expiresAtValue,
      })
    );
  }

  private get currentLanguage(): string | null {
    return this.sessionProfileProjection.getCurrentLanguage();
  }

  private get expiresAtValue(): number | null {
    const rawExpiresAt = this.sessionStorage.getDecryptedItem('expires_at');
    if (!rawExpiresAt) return null;

    try {
      const parsed: unknown = JSON.parse(rawExpiresAt);
      return typeof parsed === 'number' ? parsed : null;
    } catch (error) {
      console.warn('[BSH.SessionService] could not parse expires_at', error);
      return null;
    }
  }
}
