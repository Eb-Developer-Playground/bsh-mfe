import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RandomNameService {
  private _jsonURL = 'assets/data';

  constructor(private http: HttpClient) {}

  generateName(
    gender?: string
  ): Observable<{ firstName: string; lastName: string }> {
    return this.getJSON('names-mock.json').pipe(
      switchMap(names => {
        return this.getJSON('surnames-mock.json').pipe(
          map(surnames => {
            const firstName = this.pickRandom(names);
            const lastName = this.pickRandom(surnames);
            return { firstName, lastName } /*`${firstName} ${lastName}`*/;
          })
        );
      })
    );
  }

  private fetchNames(nameType: string): Observable<any> {
    const url = `https://www.randomlists.com/data/names-${nameType}.json`;
    return this.http.get<any>(url);
  }

  private pickRandom(list: string[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  private getJSON(jsonFileName: string): Observable<any> {
    const url = `${this._jsonURL}/${jsonFileName}`;
    return this.http.get(url);
  }
}
