import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-app-settings',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss'
})
export class AppSettingsComponent implements OnInit {
  activeTab: 'General' | 'Chat Embed' | 'API' = 'General';

  authStatus = {
    connected: true,
    type: 'OAuth 2.0',
    firstAuth: 'Oct 15, 2025',
    lastUpdated: '2 hours ago',
    tokenExpiry: '30 days',
    scope: 'Read/Write'
  };

  constructor() {}

  ngOnInit(): void {
    console.log('App Settings component initialized');
  }

  onSaveSetting(settingName: string, value: any): void {
    console.log(`Saving setting ${settingName}:`, value);
    // TODO: Implement save functionality
  }

  onResetSettings(): void {
    console.log('Resetting settings to default');
    // TODO: Implement reset functionality
  }

  setTab(tab: 'General' | 'Chat Embed' | 'API') {
    this.activeTab = tab;
  }
}
