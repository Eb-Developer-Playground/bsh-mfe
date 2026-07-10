import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BioVerifyService {
  private bioVerifyDataSubject = new Subject<any>();
  bioVerifyData$ = this.bioVerifyDataSubject.asObservable();

  constructor() {}

  setBioVerifyDataSubject(data: any) {
    this.bioVerifyDataSubject.next(data);
  }
}
