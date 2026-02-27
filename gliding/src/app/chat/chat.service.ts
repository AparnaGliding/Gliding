import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {ChatMessageModel, ChatModel, ChatRequest, ApplicationModuleModel, ArticleListResponseModel, DirectoryItemResponseModel} from './chat.model';
import {catchError} from 'rxjs/operators';
import {environment} from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private chatIdCounter = 0;
  private baseUrl = `/chat`;
  constructor(private http: HttpClient) {
  }

  setNextChatId(nextId: number): void {
    this.chatIdCounter = nextId;
  }

  getNextChatId(): string {
    const currentId = this.chatIdCounter;
    this.chatIdCounter++;
    return currentId.toString();
  }

  getHistory(accountId: string, userId: number, offset: number = 0, limit: number = 50 , applicationModuleId:number ): Observable<ChatModel[]> {
    const params = new HttpParams()
      .set('applicationId', accountId.toString())
      .set('userId', userId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString())
       .set('applicationModuleId', applicationModuleId);

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

  // streamChat(req: ChatRequest, token?: string): Observable<string> {
  //   return new Observable<string>((observer) => {
  //     console.log('Chat id', req.chatId);
  //     const params = new URLSearchParams({
  //       question: req.question,
  //       domain: req.domain,
  //       applicationId: req.accountId,
  //       userId: req.userId,
  //       chatId: req.chatId,
  //       applicationModuleId: req.applicationModuleId.toString() || '0',
  //       saveInHistory: 'true'
  //     }).toString();
  //     const url = `${this.baseUrl}?${params}`;
  //     const es = new EventSource(url, { withCredentials: false });
  //     es.onmessage = (e: MessageEvent) => {
  //       try {
  //         const data = JSON.parse(e.data);
  //         if (data.isLast === true) {
  //           observer.complete();
  //           es.close();
  //           return;
  //         }
  //         observer.next(e.data);
  //       } catch (e) {
  //         if (e.data === '[DONE]') {
  //           observer.complete();
  //           es.close();
  //           return;
  //         }
  //         observer.next(e.data);
  //       }
  //     };
  //     es.onerror = (err) => {
  //       observer.error(err);
  //       es.close();
  //     };
  //     return () => es.close();
  //   });
  // }

  streamChat(req: ChatRequest, token?: string): Observable<string> {
    return new Observable<string>((observer) => {
      console.log('Chat id', req.chatId);
      const params = new URLSearchParams({
        question: req.question,
        domain: req.domain,
        applicationId: req.accountId,
        userId: req.userId,
        chatId: req.chatId,
        applicationModuleId: req.applicationModuleId.toString() || '0',
        saveInHistory: 'true'
      }).toString();
      const host = `${window.location.protocol}//${window.location.hostname}${environment.backend_path}`;
      const url = `${host}/api/aq/agent/chat?${params}`;
      
      let abortController = new AbortController();
      
      fetch(url, {
        method: 'POST',
        credentials: 'include',
        signal: abortController.signal,
        headers: {
          'Accept': 'text/event-stream'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        function read() {
          reader?.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6);
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.isLast === true) {
                    observer.complete();
                    return;
                  }
                  observer.next(data);
                } catch (e) {
                  if (data === '[DONE]') {
                    observer.complete();
                    return;
                  }
                  observer.next(data);
                }
              }
            }
            read();
          }).catch(err => observer.error(err));
        }
        read();
      })
      .catch(err => observer.error(err));
      
      return () => abortController.abort();
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

  getArticles(applicationId: number, applicationModuleId: number, userId: number, offset: number, limit: number): Observable<ArticleListResponseModel[]> {
    const params = new HttpParams()
      .set('applicationId', applicationId.toString())
      .set('applicationModuleId', applicationModuleId.toString())
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

  uploadFile(file: File, name: string, parentId: number | null | undefined, categoryId: number, userId: number, applicationId: number, isFolder: boolean, userUploaded: boolean): Observable<DirectoryItemResponseModel> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (parentId !== null && parentId !== undefined) {
      formData.append('parentId', parentId.toString());
    }
    formData.append('categoryId', categoryId.toString());
    formData.append('userId', userId.toString());
    formData.append('applicationId', applicationId.toString());
    formData.append('isFolder', String(isFolder));
    formData.append('userUploaded', String(userUploaded));
    return this.http.post<DirectoryItemResponseModel>('/directory/file', formData);
  }

}
