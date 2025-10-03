import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {ErrorHandler, importProvidersFrom} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbDateAdapter, NgbDatepickerI18n, NgbModalConfig, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule} from 'ngx-toastr';
import {AppRoutingModule} from './app/app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {APP_BASE_HREF, CurrencyPipe, DatePipe} from '@angular/common';
import {provideAnimations} from '@angular/platform-browser/animations';
import {GlobalErrorHandler} from './shared/global-error-handler';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, NgbModule, ToastrModule.forRoot({
        timeOut: 2500,
        extendedTimeOut: 2500,
        closeButton: true,
        progressBar: false,
        positionClass: 'toast-bottom-right',
        enableHtml: true,
        easeTime: 200,
        maxOpened: 3,
        preventDuplicates: true
      }), ReactiveFormsModule),
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: '/' + (localStorage.getItem('type') || '') },
    { provide: DatePipe, useClass: DatePipe },
    { provide: CurrencyPipe, useClass: CurrencyPipe },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    NgbModalConfig,
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
})
  .catch(err => console.log(err));
