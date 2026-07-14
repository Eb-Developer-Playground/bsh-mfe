import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NetworkSpeedInterface } from '../interfaces/network-speed.interface';

@Injectable({
  providedIn: 'root'
})
export class NetworkSpeedService implements NetworkSpeedInterface {
  // Stub for network-speed service - to be replaced when network-speed components are migrated
  constructor() { }

  getSpeed(): Observable<any> {
    // TODO: Implement when network-speed components are migrated
    console.log('NetworkSpeedService.getSpeed() called - stub implementation');
    return of({ effectiveType: '4g', downlink: 10, rtt: 100 });
  }

  checkIfLastMessageIsExpired() {
    // TODO: Implement when network-speed components are migrated
    console.log('NetworkSpeedService.checkIfLastMessageIsExpired() called - stub implementation');
    return false;
  }

  setDateOfLastMessage(date: Date) {
    // TODO: Implement when network-speed components are migrated
    console.log('NetworkSpeedService.setDateOfLastMessage() called - stub implementation');
  }
}
