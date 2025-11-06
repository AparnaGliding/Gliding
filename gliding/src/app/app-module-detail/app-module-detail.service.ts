import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ArticleResponseModel} from './app-module-detail.model';

@Injectable({
  providedIn: 'root'
})

export class AppModuleDetailService {
  constructor(private http: HttpClient) {
  }

  getArticleById(articleId: number): Observable<ArticleResponseModel[]> {
    return this.http.get<ArticleResponseModel[]>(`/article/${articleId}`).pipe(
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
