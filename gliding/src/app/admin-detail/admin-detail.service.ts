import {Injectable} from '@angular/core';
import {catchError, map, Observable, throwError} from 'rxjs';
import {ArticleListResponseModel} from '../app-dashboard/app-dashboard.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {IntegrationConnectionRequest, UserModel} from './admin-detail.model';

@Injectable({
  providedIn: 'root'
})

export class AdminDetailService {

  constructor(private http: HttpClient) {
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
