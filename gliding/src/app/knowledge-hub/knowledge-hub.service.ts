import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {
  FreshdeskCategoryRequest,
  FreshdeskFolderRequest,
  ListCategoryModel,
  ListFolderModel
} from './knowledge-hub.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class KnowledgeHubComponent {
  constructor(private http: HttpClient) {
  }

  createCategory(category: FreshdeskCategoryRequest): Observable<boolean> {

    return this.http.post<boolean>('/freshdesk/create/category', category, {observe: 'response'}).pipe(
      map((res: any) => {
        return res.body || false;
      }),
      catchError(error => {
        console.error('Error creating category in freshdesk :', error);
        return throwError(() => false);
      })
    );
  }


  listAllCategory(): Observable<ListCategoryModel[] | null> {
    return this.http.get<ListCategoryModel[]>('/freshdesk/list/category').pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching Freshdesk connection:', error);
        return throwError(() => null);
      })
    );
  }

  createFolder(folder: FreshdeskFolderRequest, categoryId: number): Observable<boolean> {
    // @ts-ignore
    return this.http.post<boolean>(`/freshdesk/create/folder/${categoryId}`, folder).pipe(
      map((res: any) => {
        return res.body || false;
      }),
      catchError(error => {
        console.error('Error creating category in freshdesk :', error);
        return throwError(() => false);
      })
    );
  }


  listAllFolders(category: ListCategoryModel): Observable<ListFolderModel[] | null> {
    // @ts-ignore
    return this.http.post<ListFolderModel[]>('/freshdesk/list/folder', category).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching Freshdesk connection:', error);
        return throwError(() => null);
      })
    );
  }

  publishArticle(articleId: number, folderId: number): Observable<any> {
    return this.http.post(`/freshdesk/publish/${articleId}/${folderId}`, {}, { observe: 'response' })
      .pipe(
        map((res: any) => {
          return res.body;
        }),
        catchError(error => {
          console.error('Error publishing article:', error);
          return throwError(() => null);
        })
      );
  }
}
