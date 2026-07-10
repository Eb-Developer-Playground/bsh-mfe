import { ClipboardModule } from '@angular/cdk/clipboard';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { ApiService, SessionService } from '@shared/services';
import {
  IUserPermission,
  IUserRole,
} from '@shared/services/session/session.service';
import { forkJoin, of } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

interface IPermissionInfo {
  id: string;
  permissionName: string;
  permissionType: string;
  permissionDescription: string;
}

@Component({
  selector: 'app-user-profile',
  imports: [
    ClipboardModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    TranslatePipe,
    COMPAT_IMPORTS,
  ],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class UserProfile implements OnInit {
  readonly _cdRef = inject(ChangeDetectorRef);
  public readonly api = inject(ApiService);
  public readonly toast = inject(ToastService);
  public readonly session = inject(SessionService);

  constructor(
    public dialogRef: MatDialogRef<UserProfile>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onRefreshSession(): void {
    this.session
      .updateSession(undefined, this.session.userBank, false)
      .subscribe(() => {
        if (this.session.authVersion === '2')
          forkJoin([
            this.api
              .get<{ roles: IUserRole[] }>('/adminportalauth/api/userinfo')
              .pipe(
                retry(2),
                catchError((_err: Error) => of({ roles: [] }))
              ),
            this.api
              .get<
                IPermissionInfo[]
              >('/adminportalauth/api/userinfo/permissions')
              .pipe(
                retry(2),
                catchError((_err: Error) => of([]))
              ),
          ]).pipe(
            tap(([_info, _permissions]) => {
              const data: IUserRole[] = _info.roles;
              data.sort((a, b) => a.name.localeCompare(b.name));
              data.forEach((role: IUserRole) => {
                role.permissions.forEach((p: IUserPermission) => {
                  p.permissionType = _permissions.find(
                    _p => _p.permissionName === p.permissionType
                  )?.permissionType;
                });
                role.permissions.sort((a, b) => a.name.localeCompare(b.name));
              });
              this.session.roles = data;
            })
          );
      });
  }

  onCopied(): void {
    this.toast.show(
      null,
      'Token copied! Kindly paste to share.',
      MessageBoxType.SUCCESS,
      1000
    );
  }
}
