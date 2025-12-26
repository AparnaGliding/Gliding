import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';
import {map, Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {WidgetConfiguration} from './appearance-cofig.model';

@Injectable({
  providedIn: 'root'
})

export class ChatEmbedConfigurationService {
  widgetId: number;

  constructor(private http: HttpClient) {
  }

  loadWidgetConfiguration(widgetId: number): Observable< WidgetConfiguration> {
    return this.http.get<any>(`/widget/config/${widgetId}`).pipe(
      catchError(error => {
        console.error(error);
        return throwError(() => error);
      })
    );
  }

  saveWidgetConfiguration(widgetId: number, widgetConfig: WidgetConfiguration): Observable<any> {
    return this.http.post<any>(`/widget/${widgetId}`, widgetConfig).pipe(
      catchError(error => {
        console.error('Error saving widget configuration:', error);
        return throwError(() => error);
      })
    );
  }
}
