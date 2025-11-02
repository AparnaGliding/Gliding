import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import { CategoryListResponseModel, DirectoryItemResponseModel, ReferencableType, ArticleContent } from '../models/knowledge-hub.models';
import {
  FreshdeskCategoryRequest,
  FreshdeskFolderRequest,
  ListCategoryModel,
  ListFolderModel
} from '../knowledge-hub.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeHubService {
  private readonly appId = 1; // Always use appId as 1 as specified

  constructor(private http: HttpClient) {}

  getAllCategories(type: ReferencableType, limit: number = 100, offset: number = 0): Observable<CategoryListResponseModel[]> {
    const params = new HttpParams()
      .set('type', type)
      .set('appId', this.appId.toString())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<CategoryListResponseModel[]>(`/directory/category`, { params });
  }

  getItemsByCategory(
    categoryId: number,
    parentId: number | null = null,
    limit: number = 100,
    offset: number = 0
  ): Observable<DirectoryItemResponseModel[]> {
    let params = new HttpParams()
      .set('appId', this.appId.toString())
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (parentId !== null) {
      params = params.set('parentId', parentId.toString());
    }

    return this.http.get<DirectoryItemResponseModel[]>(`/directory/category/${categoryId}/items`, { params });
  }

  getArticleById(articleId: number): Observable<ArticleContent> {
    return this.http.get<ArticleContent>(`/article/${articleId}`);
  }

  publishArticle(articleId: number): Observable<any> {
    return this.http.post(`/article/${articleId}/publish`, {});
  }

  getOnlyOfficeEditUrl(articleId: number): Observable<{editUrl: string}> {
    return this.http.get<{editUrl: string}>(`/article/${articleId}/edit-url`);
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
    return this.http.post<boolean>(`/freshdesk/create/folder/${categoryId}`, folder, { observe: 'response' }).pipe(
      map((res: any) => {
        // Treat HTTP 200 as success even if body is empty/falsey
        return (res?.body === true) || (res?.status === 200);
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


  publishFreshdeskArticle(articleId: number, folderId: number): Observable<any> {
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
