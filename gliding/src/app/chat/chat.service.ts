import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {ChatMessageModel, ChatModel} from './chat.model';
import {catchError} from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})

export class ChatService {
  constructor(private http: HttpClient) {
  }

  getHistory(accountId: string, userId: number, offset: number = 0, limit: number = 50): Observable<ChatModel[]> {
    const params = new HttpParams()
      .set('applicationId', accountId.toString())
      .set('userId', userId.toString())
      .set('offset', offset.toString())
      .set('limit', limit.toString());

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
}
