import { Injectable } from '@angular/core';

import { AUTH_VERSION, User } from '../../models';
import type {
  IActionFlow,
  IUserPermission,
  IUserRole,
} from './session.service';

@Injectable({ providedIn: 'root' })
export class SessionAuthorizationService {
  getPermissions(
    isLoggedIn: boolean,
    authVersion: string,
    user: User | undefined,
    roles: IUserRole[]
  ): IUserPermission[] {
    if (!isLoggedIn || !user) return [];

    if (authVersion === AUTH_VERSION.VERSION_1) {
      return user.role
        .map(name => ({ name, actionFlows: [], statuses: [] }))
        .sort((left, right) => left.name.localeCompare(right.name));
    }

    if (authVersion === AUTH_VERSION.VERSION_2) {
      return roles
        .flatMap(role => role.permissions)
        .sort((left, right) => left.name.localeCompare(right.name));
    }

    return [];
  }

  getActionFlows(
    isLoggedIn: boolean,
    permissions: IUserPermission[]
  ): IActionFlow[] {
    if (!isLoggedIn) return [];

    return permissions
      .flatMap(permission => permission.actionFlows || [])
      .sort((left, right) => left.localeCompare(right));
  }

  getRoles(isLoggedIn: boolean, user: User | undefined): string[] {
    return isLoggedIn && user ? user.role : [];
  }

  hasRole(isLoggedIn: boolean, roles: string[], role: string): boolean {
    return isLoggedIn ? roles.includes(role) : false;
  }

  hasPermission(
    isLoggedIn: boolean,
    permissions: IUserPermission[],
    permission: string,
    permissionType?: string
  ): boolean {
    if (!isLoggedIn) return false;

    return permissions.some(currentPermission => {
      if (currentPermission.name !== permission) {
        return false;
      }

      return permissionType
        ? currentPermission.permissionType === permissionType
        : true;
    });
  }

  hasProcessPermission(
    isLoggedIn: boolean,
    authVersion: string,
    permissions: IUserPermission[],
    process: string,
    permission?: string,
    permissionType?: string
  ): boolean {
    if (!isLoggedIn || authVersion !== AUTH_VERSION.VERSION_2) {
      return false;
    }

    return permissions.some(currentPermission => {
      if (permission && currentPermission.name !== permission) {
        return false;
      }

      if (permissionType && currentPermission.permissionType !== permissionType) {
        return false;
      }

      return currentPermission.actionFlows?.includes(process) || false;
    });
  }

  hasFeatureRole(
    isLoggedIn: boolean,
    featureRoles: User['featureRoles'] | undefined,
    role: string
  ): boolean {
    if (!isLoggedIn) {
      return false;
    }

    return (
      featureRoles?.some(
        featureRole =>
          featureRole.name.toLowerCase() === role.toLowerCase() &&
          featureRole.visible &&
          !featureRole.disabled
      ) || false
    );
  }

  hasFeatureFlag(isLoggedIn: boolean, feature: unknown): boolean {
    if (!isLoggedIn || !feature || typeof feature !== 'object') {
      return false;
    }

    const candidate = feature as {
      activate?: { environment?: boolean };
    };

    return candidate.activate?.environment || false;
  }

  isDigitalSupportUser(
    isLoggedIn: boolean,
    featureRoles: User['featureRoles'] | undefined,
    roles: string[]
  ): boolean {
    return (
      this.hasFeatureRole(
        isLoggedIn,
        featureRoles,
        'AccountManagement.ViewWithReason'
      ) && this.hasRole(isLoggedIn, roles, 'AccountManagement.EfrontUser')
    );
  }
}
