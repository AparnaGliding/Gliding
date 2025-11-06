import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {ArticleResponseModel} from '../app-module-detail/app-module-detail.model';
import {catchError} from 'rxjs/operators';
import {AddApplicationModel} from './create-application.model';

@Injectable({
  providedIn: 'root'
})

export class CreateApplicationService {
  constructor(private http: HttpClient) {
  }

  addApp(app: AddApplicationModel): Observable<boolean> {

    return this.http.post<boolean>('/application', app, { observe: 'response' }).pipe(
      map((res: any) => {
        return res.body || false;
      }),
      catchError(error => {
        console.error('Error creating application :', error);
        return throwError(() => false);
      })
    );
  }


}
