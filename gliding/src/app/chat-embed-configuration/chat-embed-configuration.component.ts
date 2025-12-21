import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

import { AppearenceComponent } from './appearence/appearence.component';
import { AiBehaviourComponent } from './ai-behaviour/ai-behaviour.component';
import { EmbedCodeComponent } from './embed-code/embed-code.component';
import {ChatEmbedConfigurationService} from './chat-embed-configuration.service';
import {WidgetConfiguration} from "./appearance-cofig.model";

@Component({
  selector: 'app-chat-embed-configuration',
  standalone: true,
  templateUrl: './chat-embed-configuration.component.html',
  styleUrl: './chat-embed-configuration.component.scss',
  imports: [
    CommonModule,
    CardModule,
    TabsModule,
    AppearenceComponent,
    AiBehaviourComponent,
    EmbedCodeComponent
  ]
})
export class ChatEmbedConfigurationComponent implements OnInit {
  activeTab = '0';
  widgetId = 1;
  widgetConfig: WidgetConfiguration;

  constructor(private chatEmbedConfigurationService: ChatEmbedConfigurationService ) { }

  ngOnInit(): void {
    this.chatEmbedConfigurationService
        .loadWidgetConfiguration(this.widgetId)
        .subscribe({
          next: (response) => {
            this.widgetConfig = response;
            console.log('Widget config:', response);
          },
          error: (err) => {
            console.error('Failed to load widget config', err);
          }
        });
  }
}
