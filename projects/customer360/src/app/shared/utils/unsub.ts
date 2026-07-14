import { Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class Unsub implements OnDestroy {
  cleanUp: Subject<any> = new Subject<any>();

  ngOnDestroy(): void {
    // @ts-ignore
    this.cleanUp.next('');
    this.cleanUp.complete();
  }
}

// no first name for corp acc
// no gender
// no doc id
//for both no expiry
//for both no tax number
