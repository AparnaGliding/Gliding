import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import {ErrorHandler, importProvidersFrom} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrModule} from 'ngx-toastr';
import {AppRoutingModule} from './app/app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {provideAnimations} from '@angular/platform-browser/animations';
import {GlobalErrorHandler} from './app/shared/global-error-handler';
import {AuthInterceptor} from './app/auth/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, ToastrModule.forRoot({
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
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: DatePipe, useClass: DatePipe },
    { provide: CurrencyPipe, useClass: CurrencyPipe },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
})
  .catch(err => console.log(err));
