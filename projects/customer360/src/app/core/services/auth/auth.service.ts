import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { IUser } from './auth-model';
import { MOCKTOKEN } from './mock-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<IUser>({});

  decodeToken(token: string): any {
    return jwtDecode(token);
  }

  public get currentUser(): IUser {
    this.userSubject.next(
      this.decodeToken(
        JSON.parse(<string>localStorage.getItem('access_token')).access_token
      )
    );
    // this.userSubject.next(this.decodeToken(MOCKTOKEN.access_token))
    //console.log(this.userSubject.value)
    return this.userSubject.value;
  }
}
