import { effect, inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { addSeconds, isBefore } from 'date-fns';

import { BehaviorSubject, finalize, Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { LoaderService } from '../../modules/loader';
import { ILocale } from '../../static/locales';
import { TimeoutDialog } from '../../dialogs';
import { AUTH_VERSION, User } from '../../models';
import { default as SUBSIDIARIES } from '../../../../assets/data/subsidiaries.json';
import { default as LOCALES } from '../../../../assets/data/language-locales.json';
import { environment as env } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { RemoteAuthStateService } from 'equity-auth';

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
  user!: User;
  updatingSession!: boolean;
  dialogRef!: MatDialogRef<any> | undefined;
  _userSubject = new BehaviorSubject<{}>({});
  _roles!: IUserRole[];

  _isActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isActive(): Observable<any> {
    return this._isActive.asObservable();
  }

  _onChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get onChanged(): Observable<any> {
    return this._onChanged.asObservable();
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
            permissions = this.user.role.map((r) => {
                return {name: r, actionFlows: [], statuses: []};
            });
        } else if (this.authVersion === AUTH_VERSION.VERSION_2) {
            permissions = this.roles
                .map((r) => r.permissions)
                .reduce((acc, cur) => [...acc, ...cur], []);
        }
        return permissions.sort((a, b) => a.name.localeCompare(b.name));
    }

    get actionFlows(): IActionFlow[] {
        if (!this.isLoggedIn()) return [];
        return this.permissions
            .map((r) => r?.actionFlows || [])
            .reduce((acc, cur) => [...acc, ...cur], [])
            .sort((a, b) => a.localeCompare(b));
    }

  set expiresAt(m: number) {
    localStorage.setItem('expires_at', JSON.stringify(m));
  }

  get expiresAt(): number {
    try {
      return JSON.parse(<string>localStorage.getItem('expires_at'));
    } catch {
      return 0;
    }
  }

  set syncToken(token: string | undefined) {
    localStorage.setItem('syncRt', token || '');
  }

  get syncToken(): string | undefined {
    return localStorage.getItem('syncRt') || '';
  }

  set loginResponse(resp: ILoginResponse) {
    localStorage.setItem('access_token', JSON.stringify(resp));
  }

  get loginResponse(): ILoginResponse {
    const token = this.remoteAuth.accessToken;
    if (!token) return null as unknown as ILoginResponse;
    return { access_token: token, expires_in: 0, token_type: 'Bearer' };
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

  private http = inject(HttpClient);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private loader = inject(LoaderService);
  private readonly remoteAuth = inject(RemoteAuthStateService);

  constructor() {
    effect(() => {
      const token = this.remoteAuth.authState().accessToken;
      if (token) {
        this.user = jwtDecode(token);
        localStorage.setItem('bankId', this.user?.bankId);
      }
    });
  }

  public decodeToken(token: string): any {
    return jwtDecode(token);
  }

  public get currentUser(): any {
    if (!this.loginResponse.access_token) return null;
    this._userSubject.next(this.decodeToken(this.loginResponse.access_token));
    return this._userSubject.value;
  }

  // NOTE: loginResponse to be passed immediately after session retrieval
  public setSession(loginResponse?: any) {
    if (loginResponse) {
      this.loginResponse = loginResponse;
      this.expiresAt = addSeconds(Date.now(), loginResponse.expires_in).getTime();
    }
    const token = this.loginResponse?.access_token;
    if (token) {
      this.user = jwtDecode(token);
      localStorage.setItem("bankId", this.user?.bankId);
    }
  }

  public isLoggedIn() {
    return this.remoteAuth.isAuthenticated();
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
        return this.permissions.some((p) => p.name === permission);
    }

    public hasMarkerPermission(permission: string): boolean {
        if (!this.isLoggedIn()) return false;
        return this.permissions.some((p) => p.name === permission && p.permissionType === "Maker");
    }

    public hasCheckerPermission(permission: string): boolean {
        if (!this.isLoggedIn()) return false;
        return this.permissions.some(
            (p) => p.name === permission && p.permissionType === "Checker"
        );
    }

    public hasFeatureRole$(roleName: string): Observable<boolean> {
        if (!this.loginResponse.access_token) return of(false);
        const url = new URL(env.apiUrl);
        url.pathname = "/adminportalauth/api/userinfo/oldrole";
        url.searchParams.set("role", roleName);
        return this.http.get<boolean>(`${url}`, {
            headers: new HttpHeaders({
                Accept: "application/json",
                Authorization: "Bearer " + this.loginResponse.access_token
            })
        });
    }

    public isMakerForProcess(process: string): boolean {
        if (!this.isLoggedIn() || this.authVersion !== "2") return false;
        const perm = this.permissions.find((p) => p.permissionType === "Maker");
        return perm?.actionFlows?.includes(process) || false;
    }

    public isCheckerForProcess(process: string): boolean {
        if (!this.isLoggedIn() || this.authVersion !== "2") return false;
        const perm = this.permissions.find((p) => p.permissionType === "Checker");
        return perm?.actionFlows?.includes(process) || false;
    }

    public hasPermissionForProcess(permission: string, process: string): boolean {
        if (!this.isLoggedIn() || this.authVersion !== "2") return false;
        const perm = this.permissions.find((p) => p.name === permission);
        return perm?.actionFlows?.includes(process) || false;
    }

    public hasMakerPermissionForProcess(permission: string, process: string): boolean {
        if (!this.isLoggedIn() || this.authVersion !== "2") return false;
        const perm = this.permissions.find(
            (p) => p.name === permission && p.permissionType === "Maker"
        );
        return perm?.actionFlows?.includes(process) || false;
    }

    public hasCheckerPermissionForProcess(permission: string, process: string): boolean {
        if (!this.isLoggedIn() || this.authVersion !== "2") return false;
        const perm = this.permissions.find(
            (p) => p.name === permission && p.permissionType === "Checker"
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
    this.loader.isLoading.next(true);
    return this.http
      .post(`${env.apiUrl}/adminportalauth/api/authorization/logout`, {})
      .pipe(
        finalize(() => {
          localStorage.removeItem('expires_at');
          localStorage.removeItem('access_token');
          Object.assign(this.user, {});

          // Clear all account selection and customer data
          // this.accountSelectionService.clearAllAccountData();

          finalize(() => this.loader.isLoading.next(false));
        })
      );
  }

  login(returnPath?: any, reAuth?: any, bankId?: string) {
    const returnUrl = returnPath || this.getUrlParameters() || '/dashboard';
    const params = new URLSearchParams();
    const locale = JSON.parse((localStorage.getItem('user-locale') || '{"language":"en-GB"}'));
    const host = window.location.port
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : `${window.location.protocol}//${window.location.hostname}`;
    if (!bankId) // Session might be wiped out, default to local storage value.
      bankId = localStorage.getItem("bankId") || "";
    params.set('re-auth', `${reAuth || 0}`);
    params.set('returnUrl', host + returnUrl);
    params.set('lang', locale?.language);
    params.set('bankId', bankId || "");
    window.location.replace(
      `${env.adminPortalUrl}/login/login/?${params.toString()}`
    );
  }

  updateSession(
    reIssue?: string,
    bankId?: any,
    showLoader = true
  ): Observable<any> {
    if (this.updatingSession) return of(true);
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
    return this.http
      .post(`${env.apiUrl}/adminportalauth/oauth/microsoft`, body.toString(), {
        headers: new HttpHeaders(headers),
      })
      .pipe(
        map(r => {
          this.syncToken = reIssue;
          this.setSession(r);
          this._onChanged.next(this.isLoggedIn());
          return this.isLoggedIn();
        }),
        shareReplay(),
        finalize(() => (this.updatingSession = false))
      );
  }

  routeToUrl(url: string | URL) {
        let lang = "";
        if(localStorage.getItem("user-locale"))
            lang = JSON.parse(<string>localStorage.getItem("user-locale")).language;
        const parts = url.toString().split("?");
        const params = parts?.[1] || "";
        const rtParams = new URLSearchParams({
            rt: this.reissueToken,
            bankId: this.userBank,
            lang: lang
        });
        const toUrl = new URL(parts?.[0]);
        toUrl.search = new URLSearchParams(`${rtParams.toString()}&${params}`).toString();
        localStorage.removeItem("expires_at");
        localStorage.removeItem("access_token");
        window.location.replace(toUrl);
  }
}
