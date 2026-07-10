import { User } from './user.model';

export interface RequestSessionToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at?: number;
}

export interface SessionToken {
  user: User;
  expiresIn: number;
  expiresAt: number;
}
