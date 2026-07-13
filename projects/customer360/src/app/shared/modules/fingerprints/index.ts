import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FingerprintsService {
  verify(_input?: any): Observable<any> {
    return of(null);
  }
}

export * from './models';
