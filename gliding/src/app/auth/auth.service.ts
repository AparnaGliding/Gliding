import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, catchError, of, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private ssoPasswordLoginEnabled = false;
  private loggedIn = false;


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


  login(credentials: any)  {
    return this.http.post<any>(`/auth/login`, credentials)
      .pipe(map((authRes: HttpResponse<any>) => {
          this.loggedIn = !!authRes.body;
          return this.loggedIn;
        }));
  }

}
