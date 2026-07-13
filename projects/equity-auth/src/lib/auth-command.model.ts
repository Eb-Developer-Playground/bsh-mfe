export type AuthCommandType = 'login' | 'logout' | 'refresh';

export interface AuthCommand {
  type: AuthCommandType;
  returnUrl?: string;
  reAuth?: string;
  bankId?: string;
}
