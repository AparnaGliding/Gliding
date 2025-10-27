import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, catchError, of, Observable, tap} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private ssoPasswordLoginEnabled = false;

  constructor(private http: HttpClient) {}

  validateDomain() {
    return this.http.get('/auth/domain').pipe(
      map((model: any) => {
        this.ssoPasswordLoginEnabled = model.ssoPasswordLoginEnabled;
        return model.isValid;
      }),
      catchError(() => {
      // **************************** temperory solution ************************************
        const mockResponse = {
          isValid: true,
          ssoPasswordLoginEnabled: true
        };
        this.ssoPasswordLoginEnabled = mockResponse.ssoPasswordLoginEnabled;
        return of(mockResponse.isValid);
      })
    );
  }


}
