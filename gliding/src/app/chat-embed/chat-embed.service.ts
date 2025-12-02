import {Injectable, OnInit} from '@angular/core';
import {map, Observable, throwError} from 'rxjs';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {ChatMessageModel, ChatModel} from '../chat/chat.model';
import {ApplicationListingModel, WidgetResponseModel} from './chat-embed.model';
import {catchError} from 'rxjs/operators';
import {ChatRequest} from './model/chats.model';

@Injectable({
  providedIn: 'root'
})


export class ChatEmbedService {
  private chatIdCounter = 0;
  // public baseUrl = `http://localhost:8080/api/aq`;
  public baseUrl = ``;

  constructor(private http: HttpClient) {
  }

  getConfigurationForWidget(widgetId: string): Observable<WidgetResponseModel> {
    const full_url = `${this.baseUrl}/widget/${widgetId}`;
    return this.http.get<WidgetResponseModel>(full_url).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getApplicationDetails(applicationId: string): Observable<ApplicationListingModel> {
    return this.http.get<ApplicationListingModel>(`${this.baseUrl}/application/${applicationId}`).pipe(
        map((res: any) => {
          return res;
    }),
        catchError(error => {
          throw error;
        })
    );
  }
  getLatestChatId(applicationId: string , userId: string): Observable<string> {
    const params = new HttpParams()
        .set('applicationId', applicationId)
        .set('externalUserId', userId);
    return this.http.get<number>(`${this.baseUrl}/chat/latest` , {params}).pipe(
        map((res: any) => {
          return res;
        }),
        catchError(error => {
          throw error;
        })
    );
  }

  createNewChat(req: ChatRequest): Observable<string> {
    console.log(req);
    return this.http.post<string>(`${this.baseUrl}/chat/create`, req).pipe(
        map((res: any) => {
          return res || [];
        }),
        catchError(error => {
          console.error('Error fetching chat messages:', error);
          throw error;
        })
    );
  }

getChatMessages(chatId: number, offset: number = 0, limit: number = 100): Observable<ChatMessageModel[]> {
  const params = new HttpParams()
    .set('chatId', chatId.toString())
    .set('offset', offset.toString())
    .set('limit', limit.toString());


  return this.http.get<ChatModel[]>(`${this.baseUrl}/chat/chat` , { params }).pipe(
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
  return this.http.get(`${this.baseUrl}/screenshots/${filename}`, {
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
    const params = new URLSearchParams({
      question: req.question,
      domain: req.domain,
      applicationId: req.applicationId,
      externalUserId : req.externalUserId ,
      chatId: req.chatId,
      applicationModuleId: req.applicationModuleId.toString() || '0',
      saveInHistory: 'true',
      tone: 'PROFESSIONAL',
      formalityLevel: 'BALANCED',
      customInstructions: 'dont add images in a output'
    }).toString();
    // const url = `${this.baseUrl}/chat?${params}`;
    const url = `http://localhost:8081/api/aq/chat?${params}`;

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


}
