import {Injectable} from '@angular/core';
import {catchError, map, Observable} from 'rxjs';
import {ArticleListResponseModel} from '../app-dashboard/app-dashboard.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {UserModel} from './admin-detail.model';

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

}
