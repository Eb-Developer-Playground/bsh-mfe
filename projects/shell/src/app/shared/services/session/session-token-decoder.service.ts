import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

import { User } from '../../models';

@Injectable({ providedIn: 'root' })
export class SessionTokenDecoderService {
  decodeUser(token: string): User {
    return jwtDecode<User>(token);
  }
}
