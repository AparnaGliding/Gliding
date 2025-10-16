/*
 * Copyright (c) 2023 Terzo Technologies Inc - All Rights Reserved
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */

import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError, TimeoutError} from 'rxjs';
import {Injectable} from '@angular/core';
import {catchError, finalize, timeout} from 'rxjs/operators';
import {Router} from '@angular/router';;
import {environment} from '../../environments/environment';
import {BannerService} from '../shared/banner.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private bannerService: BannerService
             ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // @ts-ignore
    const data = JSON.parse(localStorage.getItem('sd'));
    let reqCopy: HttpRequest<any>;
    let host = `${window.location.protocol}//${window.location.host}${environment.backend_path}`;
    const actuatorUrl = req.url === '/actuator/health';
    const oauthCallBackUrl = (req.url === '/api/auth/oauth2/authorize/callback' || req.url === '/api/auth/oauth2/authorize/deny');
    if (!actuatorUrl && !oauthCallBackUrl) {
      host = host + '/api/aq';
    }
    if (data?.expires) {
      reqCopy = req.clone({
        url: `${host}${req.url}`,
        withCredentials: true,
        headers: req.headers
      });
    } else {
      reqCopy = req.clone({
        url: `${host}${req.url}`,
        withCredentials: true
      });
    }

    const handleError = () => {
      this.router.navigate(['/service-down'], {skipLocationChange: true});
    };

    const reloadPage = () => {
      localStorage.removeItem('sd');
      window.location.reload();
    };

    if (actuatorUrl) {
      return next.handle(reqCopy);
    }

    return next.handle(reqCopy).pipe(timeout(180000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          console.error('Request timed out after ' + 180000 + 'ms');
        } else if (err.status === 401) {
          this.bannerService.showError('Insufficient Permission');
        } else if (err.status === 403) {
          if (err.error === 'Resource Requested from Unauthorized IP Address') {
            this.router.navigate(['/forbidden-domain']);
          } else if (err.error === 'Inactive Account') {
            this.router.navigate(['/inactive-account'], { skipLocationChange: true });
          }
        } else if (err.status === 400) {
          err.error === 'Invalid Domain' ? this.router.navigate(['/invalid-domain'],
            {skipLocationChange: true}) : this.bannerService.showError(`${err.error}`);
        } else if (err.status === 429) {
          this.bannerService.showError(`[Limit Exceeded]<br/> ${err.error}`);
        } else if (err.status === 404) {
          this.router.navigate(['/page-not-found'], {skipLocationChange: true});
        }  else if (err.status === 0) {
          handleError();
        } else {
          this.bannerService.showError(`[Error]<br/> Error in processing request.`);
        }
        return throwError(err);
      }),
      finalize(() => {
      })
    );
  }
}
