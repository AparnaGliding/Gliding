import {AuthService} from './auth.service';
import {inject} from '@angular/core';
import {throwError} from 'rxjs';
import {catchError,map} from 'rxjs/operators';
import {Router} from '@angular/router';

export const DomainGuard  = () => {
return inject(AuthService).validateDomain()
  .pipe(map ( () =>  true) ,
  catchError(()  => {
    inject(Router).navigate(['/invalid-domain']);
    return throwError(() => new Error('invalid'));
    }
  ));
};
