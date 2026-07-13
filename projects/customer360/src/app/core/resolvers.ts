import { inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    ResolveFn,
    RouterStateSnapshot,
} from '@angular/router';
import { AUTH_VERSION } from '@shared/models';
import { ApiService, SessionService } from '@shared/services';
import {
    IUserPermission,
    IUserRole,
} from '@shared/services/session/session.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

interface IPermissionInfo {
    id: string;
    permissionName: string;
    permissionType: string;
    permissionDescription: string;
}

export const resolvePermissions: ResolveFn<unknown> = (
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
) => {
    const _api = inject(ApiService);
    const _session = inject(SessionService);

    if (_session.isLoggedIn()) {
        if (_session.authVersion === AUTH_VERSION.VERSION_2)
            return forkJoin([
                _api.get<{ roles: IUserRole[] }>('/adminportalauth/api/userinfo').pipe(
                    retry(2),
                    catchError((_err: Error) => of({ roles: [] as IUserRole[] }))
                ),
                _api
                    .get<IPermissionInfo[]>('/adminportalauth/api/userinfo/permissions')
                    .pipe(
                        retry(2),
                        catchError((_err: Error) => of([] as IPermissionInfo[]))
                    ),
            ]).pipe(
                tap(([_info, _permissions]) => {
                    const data: IUserRole[] = _info.roles;
                    data.sort((a, b) => a.name.localeCompare(b.name));
                    data.forEach((role: IUserRole) => {
                        role.permissions.forEach((p: IUserPermission) => {
                            p.permissionType = _permissions.find(
                                (_p) => _p.permissionName === p.permissionType
                            )?.permissionType;
                        });
                        role.permissions.sort((a, b) => a.name.localeCompare(b.name));
                    });
                    _session.roles = data;
                })
            );
    }
    return of({ successful: false });
};

@Injectable({
    providedIn: 'root',
})
export class PermissionsResolver implements Resolve<unknown> {
    private readonly api = inject(ApiService);
    private readonly session = inject(SessionService);

    resolve(
        _route: ActivatedRouteSnapshot,
        _state: RouterStateSnapshot
    ): Observable<unknown> {
        if (this.session.isLoggedIn()) {
            if (this.session.authVersion === AUTH_VERSION.VERSION_2)
                return forkJoin([
                    this.api
                        .get<{ roles: IUserRole[] }>('/adminportalauth/api/userinfo')
                        .pipe(
                            retry(2),
                            catchError((_err: Error) => of({ roles: [] as IUserRole[] }))
                        ),
                    this.api
                        .get<IPermissionInfo[]>('/adminportalauth/api/userinfo/permissions')
                        .pipe(
                            retry(2),
                            catchError((_err: Error) => of([] as IPermissionInfo[]))
                        ),
                ]).pipe(
                    tap(([_info, _permissions]) => {
                        const data: IUserRole[] = _info.roles;
                        data.sort((a, b) => a.name.localeCompare(b.name));
                        data.forEach((role: IUserRole) => {
                            role.permissions.forEach((p: IUserPermission) => {
                                p.permissionType = _permissions.find(
                                    (_p) => _p.permissionName === p.permissionType
                                )?.permissionType;
                            });
                            role.permissions.sort((a, b) => a.name.localeCompare(b.name));
                        });
                        this.session.roles = data;
                    })
                );
        }
        return of({ successful: false });
    }
}

export const resolveRoles: ResolveFn<unknown> = (
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
) => {
    const _api = inject(ApiService);
    const _session = inject(SessionService);

    if (_session.isLoggedIn())
        if (_session.authVersion === AUTH_VERSION.VERSION_2)
            return _api.get('/adminportalauth/api/userinfo/roles').pipe(
                retry(2),
                catchError((_err) => of({ roles: [] })),
                tap((_res) => {})
            );
    return of({ successful: false });
};
