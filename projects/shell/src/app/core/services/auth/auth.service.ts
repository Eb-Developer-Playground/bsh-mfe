import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AuthService {
  [key: string]: any;
  isLoggedIn(): Observable<boolean> { return of(true); }
  setUrlParameter(url: string) {}
  logout(): Observable<any> { return of(null); }
  login(user: any, role: string | null, bankId: string): Observable<any> { return of({}); }
}
