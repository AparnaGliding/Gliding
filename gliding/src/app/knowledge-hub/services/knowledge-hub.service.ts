import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryListResponseModel, DirectoryItemResponseModel, ReferencableType, ArticleContent } from '../models/knowledge-hub.models';

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
}
