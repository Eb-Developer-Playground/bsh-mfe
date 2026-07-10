import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/x-www-form-urlencoded',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class BiometricService {
  private http = inject(HttpClient);

  postMultipleCapture(values: any): Observable<any> {
    const url = environment.secugenApi + '/SGIFPCapture';
    return this.http.post<any>(url, values, httpOptions);
  }
}
