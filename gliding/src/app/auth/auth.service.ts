import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, catchError, of, throwError, Observable} from 'rxjs';

export interface UserSignUpModel {
  fullName: string;
  email: string;
  password: string;
}

export interface GoogleSignOnPayload {
  token: string;
  name: string;
  email: string;
}

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
      .pipe(map((authRes: any) => {
          const responseData = authRes.body !== undefined ? authRes.body : authRes;
          this.loggedIn = !!responseData;
          return this.loggedIn;
        }));
  }

  signUp(userSignUpModel: UserSignUpModel): Observable<any> {
    return this.http.post<any>('/auth/sign-up', userSignUpModel);
  }


  loginWithGoogle(returnUrl?: string) {
    const params = new URLSearchParams();
    if (returnUrl) params.set('returnUrl', returnUrl);
    const query = params.toString();
    const endpoint = '/auth/google';
    const target = query ? `${endpoint}?${query}` : endpoint;
    window.location.assign(target);
  }



  googleSignOn(payload: { token: string; name: string; email: string }) {
    return this.http.post<any>('/auth/google', payload);
  }
}
