import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaticDataService {
  getCountries() {
    return of([]);
  }

  getNationalities() {
    return of([]);
  }

  getRegions() {
    return of([]);
  }
}
