export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous' | 'expired';

export interface AuthUserState {
  sub: string;
  username: string;
  displayName: string;
  bankId: string;
  roles: string[];
}

export interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  tokenType: 'Bearer' | null;
  expiresAt: number | null;
  user: AuthUserState | null;
  bankId: string | null;
  language: string | null;
}

export const ANONYMOUS_AUTH_STATE: AuthState = {
  status: 'anonymous',
  accessToken: null,
  tokenType: null,
  expiresAt: null,
  user: null,
  bankId: null,
  language: null,
};

export const UNKNOWN_AUTH_STATE: AuthState = {
  ...ANONYMOUS_AUTH_STATE,
  status: 'unknown',
};
