import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, map, Observable, tap} from 'rxjs';
import {App, ApplicationListingModel, ApplicationModuleModel, ArticleListResponseModel} from './app-dashboard.model';

@Injectable({
  providedIn: 'root'
})

export class AppDashboardService {
  constructor(private http: HttpClient) {
  }

  getApplications(accountId: number): Observable<ApplicationListingModel[]> {
    const params = new HttpParams()
      .set('accountId', accountId.toString())
    return this.http.get<ApplicationListingModel[]>(`/application`, {params}).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Accounts request failed:', error);
        throw error
        // Fallback to mock data for development
      })
    );
  }

  getApplicationModules(applicationId: number): Observable<ApplicationModuleModel[]> {

    return this.http.get<ApplicationModuleModel[]>(`/application/${applicationId}/modules`).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Accounts request failed:', error);
        throw error
        // Fallback to mock data for development
      })
    );
  }



  getArticle(applicationId: number, userId: number, offset: number = 0, limit: number = 50): Observable<ArticleListResponseModel[]> {
    const params = new HttpParams()
      .set('applicationId', applicationId.toString())
      .set('userId', userId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ArticleListResponseModel[]>('/article', { params }).pipe(
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
