import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {ChatMessageModel, ChatModel, ChatRequest, ApplicationModuleModel, ArticleListResponseModel} from './chat.model';
import {catchError} from 'rxjs/operators';
import {environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private chatIdCounter = 0;
  private baseUrl = `http://${environment.hostname}${environment.backend_path}/api/aq/chat`;
  constructor(private http: HttpClient) {
  }

  getNextChatId(): string {
    this.chatIdCounter++;
    return this.chatIdCounter.toString();
  }

  getHistory(accountId: string, userId: number, offset: number = 0, limit: number = 50): Observable<ChatModel[]> {
    const params = new HttpParams()
      .set('applicationId', accountId.toString())
      .set('userId', userId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString())
       .set('applicationModuleId', 1);

    return this.http.get<ChatModel[]>('/chat/history', {params}).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching chat history:', error);
        throw error;
      })
    );
  }

  getChatMessages(chatId: number, offset: number = 0, limit: number = 100): Observable<ChatMessageModel[]> {
    const params = new HttpParams()
      .set('chatId', chatId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    return this.http.get<ChatModel[]>('/chat/chat', { params }).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching chat messages:', error);
        throw error;
      })
    );
  }

  checkAndGetScreenshotImage(filename: string): Observable<string> {
    return this.http.get(`/screenshots/${filename}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Blob>) => {
        if (response.status === 200 && response.body) {
          return URL.createObjectURL(response.body);
        }
        throw new Error('Invalid response');
      }),
      catchError(() => {
        return throwError(() => new Error(`Screenshot not found: ${filename}`));
      })
    );
  }


  streamChat(req: ChatRequest, token?: string): Observable<string> {
    return new Observable<string>((observer) => {
      console.log('Chat id', req.chatId);
      const params = new URLSearchParams({
        question: req.question,
        domain: req.domain,
        accountId: req.accountId,
        userId: req.userId,
        chatId: req.chatId,
      }).toString();
      const url = `${this.baseUrl}?${params}`;
      const es = new EventSource(url, { withCredentials: false });
      es.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.isLast === true) {
            observer.complete();
            es.close();
            return;
          }
          observer.next(e.data);
        } catch (e) {
          if (e.data === '[DONE]') {
            observer.complete();
            es.close();
            return;
          }
          observer.next(e.data);
        }
      };
      es.onerror = (err) => {
        observer.error(err);
        es.close();
      };
      return () => es.close();
    });
  }

  getModulesForApplication(applicationId: number): Observable<ApplicationModuleModel[]> {
    return this.http.get<ApplicationModuleModel[]>(`/application/${applicationId}/modules`).pipe(
      map((res: any) => {
        return res || [];
      }),
      catchError(error => {
        console.error('Error fetching modules:', error);
        throw error;
      })
    );
  }

  getArticles(applicationId: number, userId: number, offset: number, limit: number): Observable<ArticleListResponseModel[]> {
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
        console.error('Error fetching articles:', error);
        throw error;
      })
    );
  }
}
