import { Injectable, inject } from '@angular/core';

import { ANONYMOUS_AUTH_STATE, AuthState } from 'equity-auth';

import { User } from '../../models';
import { SessionTokenDecoderService } from './session-token-decoder.service';
import type { ILoginResponse } from './session.service';

export interface SessionTransitionResult {
  user: User | undefined;
  active: boolean;
  bankId: string | null;
  authState: AuthState;
}

interface BuildAuthStateParams {
  loginResponse: ILoginResponse | null;
  isLoggedIn: boolean;
  user: User | undefined;
  language: string | null;
  expiresAt: number | null;
}

@Injectable({ providedIn: 'root' })
export class SessionAuthTransitionService {
  private readonly sessionTokenDecoder = inject(SessionTokenDecoderService);

  restoreSession(
    loginResponse: ILoginResponse | null,
    isLoggedIn: boolean,
    language: string | null,
    expiresAt: number | null
  ): SessionTransitionResult {
    if (!loginResponse) {
      return {
        user: undefined,
        active: false,
        bankId: null,
        authState: this.buildAuthState({
          loginResponse: null,
          isLoggedIn: false,
          user: undefined,
          language,
          expiresAt,
        }),
      };
    }

    const user = this.sessionTokenDecoder.decodeUser(loginResponse.access_token);

    return {
      user,
      active: isLoggedIn,
      bankId: user.bankId,
      authState: this.buildAuthState({
        loginResponse,
        isLoggedIn,
        user,
        language,
        expiresAt,
      }),
    };
  }

  buildAuthState({
    loginResponse,
    isLoggedIn,
    user,
    language,
    expiresAt,
  }: BuildAuthStateParams): AuthState {
    if (!isLoggedIn || !loginResponse || !user) {
      return {
        ...ANONYMOUS_AUTH_STATE,
        status: loginResponse ? 'expired' : 'anonymous',
        language,
      };
    }

    return {
      status: 'authenticated',
      accessToken: loginResponse.access_token,
      tokenType: loginResponse.token_type,
      expiresAt,
      user: {
        sub: user.sub,
        username: user.username,
        displayName: user.displayName,
        bankId: user.bankId,
        roles: user.role,
      },
      bankId: user.bankId,
      language,
    };
  }
}
