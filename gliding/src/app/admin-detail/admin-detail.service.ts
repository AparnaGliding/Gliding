import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {ArticleListResponseModel} from '../app-dashboard/app-dashboard.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IntegrationConnectionRequest, UserModel} from './admin-detail.model';

@Injectable({
  providedIn: 'root'
})

export class AdminDetailService {

  constructor(private http: HttpClient) {
  }

  // Invite a new user to the account/application
  inviteUser(payload: {
    accountId: number;
    applicationId: number;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    type: string;
    status: string;
  }): Observable<UserModel | null> {
    return this.http.post<UserModel>('/account/user', payload).pipe(
      map((res: any) => res || null),
      catchError(error => {
        console.error('Error inviting user:', error);
        return throwError(() => null);
      })
    );
  }

  // Update existing user - send full UserModel payload
  updateUser(user: UserModel): Observable<UserModel | null> {
    return this.http.put<UserModel>(`/account/user`, user).pipe(
      map((res: any) => res || null),
      catchError(error => {
        console.error('Error updating user:', error);
        return throwError(() => null);
      })
    );
  }

  // Remove a user from the account/application
  removeUser(userId: number): Observable<boolean> {
    const params = new HttpParams().set('id', userId.toString());
    return this.http.delete<void>(`/account/user`, { params, observe: 'response' }).pipe(
      map(res => (res.status === 200 || res.status === 204)),
      catchError(error => {
        console.error('Error removing user:', error);
        return of(false);
      })
    );
  }

  getUsers(accountId: number, applicationId: number, offset: number = 0, limit: number = 50): Observable<UserModel[]> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
      .set('applicationId', applicationId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<UserModel[]>('/account/user', { params }).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching chat history:', error);
        throw error;
      })
    );
  }


  saveConnection(request: IntegrationConnectionRequest): Observable<IntegrationConnectionRequest | null> {
    return this.http.post<IntegrationConnectionRequest>('/integration/save', request).pipe(
      map((res: any) => {
        return res || null;
      }),
      catchError(error => {
        console.error('Error saving integration connection:', error);
        return throwError(() => null);
      })
    );
  }

  getConnection(): Observable<IntegrationConnectionRequest[] | null> {
    return this.http.get<IntegrationConnectionRequest[]>('/integration').pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching Freshdesk connection:', error);
        return throwError(() => null);
      })
    );
  }


}
