import {BrowserModule, createApplication} from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ChatEmbedComponent } from './app/chat-embed/chat-embed.component';
import { ChatIconComponent } from './app/chat-embed/chat-icon/chat-icon.component';

import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {ErrorHandler, importProvidersFrom} from '@angular/core';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {appConfig} from './app/app.config';
import {AppRoutingModule} from './app/app.routes';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrModule} from 'ngx-toastr';


(async () => {
  const app = await createApplication({
    providers: [
      ...appConfig.providers,
      importProvidersFrom(
          BrowserModule,
          AppRoutingModule,
          FormsModule,
          ToastrModule.forRoot({
            timeOut: 2500,
            extendedTimeOut: 2500,
            closeButton: true,
            progressBar: false,
            positionClass: 'toast-bottom-right',
            enableHtml: true,
            easeTime: 200,
            maxOpened: 3,
            preventDuplicates: true
          }),
          ReactiveFormsModule
      ),
      { provide: DatePipe, useClass: DatePipe },
      { provide: CurrencyPipe, useClass: CurrencyPipe },
      provideHttpClient(withInterceptorsFromDi()),
      provideAnimations()
    ]
  });

  const chatElement = createCustomElement(ChatEmbedComponent, {
    injector: app.injector
  });

  const chatIconElement = createCustomElement(ChatIconComponent, {
    injector: app.injector
  });

  customElements.define('my-chat-widget', chatElement);
  customElements.define('my-chat-icon', chatIconElement);
})();
