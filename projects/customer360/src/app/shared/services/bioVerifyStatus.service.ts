import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BioVerifyService {
  bioVerifyData$ = new Subject<any>();
}
