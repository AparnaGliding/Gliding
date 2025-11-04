import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HeaderComponent} from '../header/header.component';
import {ApplicationListingModel, ApplicationModuleModel} from '../app-dashboard/app-dashboard.model';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';
import { ChatService } from '../chat/chat.service';
import { ChatRequest, ChatMessage } from '../chat/chat.model';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-app-settings',
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss'
})
export class AppSettingsComponent implements OnInit {
  activeTab: string = 'General';

  authStatus = {
    connected: true,
    type: 'OAuth 2.0',
    firstAuth: 'Oct 15, 2025',
    lastUpdated: '2 hours ago',
    tokenExpiry: '30 days',
    scope: 'Read/Write'
  };

  // Chat Embed Settings
  chatEmbedSettings = {
    primaryColor: '#0066FF',
    chatTitle: 'AssistQ',
    greetingMessage: 'Hi! Ask me anything about our product.',
    inputPlaceholder: 'Ask a question...'
  };

  // Response Behavior Settings
  responseBehavior = {
    tone: 'Friendly',
    responseLength: 'Moderate',
    formalityLevel: 'Balanced',
    customInstructions: ''
  };

  // Position Settings
  positionSettings = {
    position: 'Bottom Right',
    showPoweredBy: true
  };

  // Embed code sections
  showPreview = false;

  // Preview modal
  showPreviewModal = false;
  previewMessages: any[] = [];
  previewChatMessages: ChatMessage[] = [];

  // Chat functionality properties
  previewCurrentMessage: string = '';
  previewIsSendingMessage = false;
  private currentStreamSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appDashboardService: AppDashboardService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read application name from route
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
    });

    // Load applications for header dropdown
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => this.allApplications = apps,
      error: () => this.allApplications = []
    });

    // Sync tab highlight from URL on navigation
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.syncActiveTabFromUrl();
      }
    });
    this.syncActiveTabFromUrl();
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

  // Chat Embed Methods
  getIframeEmbedCode(): string {
    const baseUrl = window.location.origin;
    const appId = this.applicationName || 'demo';
    return `<iframe
  src="${baseUrl}/chat-embed/${appId}"
  width="400"
  height="600"
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
</iframe>`;
  }

  getJavaScriptEmbedCode(): string {
    const baseUrl = window.location.origin;
    const appId = this.applicationName || 'demo';
    return `<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/chat-embed/${appId}';
  iframe.width = '400';
  iframe.height = '600';
  iframe.frameborder = '0';
  iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);';
  document.body.appendChild(iframe);
})();
</script>`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  togglePreview(): void {
    this.showPreviewModal = true;
    this.initializePreviewMessages();
  }

  initializePreviewMessages(): void {
    this.previewMessages = [
      {
        text: this.chatEmbedSettings.greetingMessage,
        isBot: true,
        timestamp: new Date()
      }
    ];
    this.previewChatMessages = [
      {
        text: this.chatEmbedSettings.greetingMessage,
        isUser: false,
        timestamp: new Date(),
        isThoughtProcess: false,
        isVerificationStep: false,
        textChunks: [],
        pendingImages: new Set<string>(),
        supportingImages: []
      }
    ];
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewMessages = [];
    this.previewChatMessages = [];
    this.previewCurrentMessage = '';
    this.previewIsSendingMessage = false;
    if (this.currentStreamSub) {
      this.currentStreamSub.unsubscribe();
    }
  }

  sendPreviewMessage(message: string): void {
    if (!message.trim() || this.previewIsSendingMessage) return;
    this.sendMessage(message);
  }

  async sendMessage(question?: string, domain?: string): Promise<void> {
    if (!question?.trim() || this.previewIsSendingMessage) return;

    const userMessage = question.trim();
    this.previewCurrentMessage = '';
    this.previewIsSendingMessage = true;

    // Add user message to both arrays
    this.previewMessages.push({
      text: userMessage,
      isBot: false,
      timestamp: new Date()
    });

    const userChatMessage: ChatMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date(),
      isThoughtProcess: false,
      isVerificationStep: false,
      textChunks: [],
      pendingImages: new Set<string>(),
      supportingImages: []
    };
    this.previewChatMessages.push(userChatMessage);

    // Create bot message placeholder
    const botMessage: ChatMessage = {
      text: '',
      isUser: false,
      timestamp: new Date(),
      isThoughtProcess: false,
      isVerificationStep: false,
      textChunks: [],
      pendingImages: new Set<string>(),
      supportingImages: []
    };
    this.previewChatMessages.push(botMessage);

    try {
      // Create chat request for streamChat
      const chatRequest: ChatRequest = {
        question: userMessage,
        domain: 'Terzo_Cloud_Contracts_final' ,
        accountId: '1',
        userId: '1',
        chatId: '30'
      };

      // Stream the response using streamChat - same logic as chat.component.ts
      this.currentStreamSub = this.chatService.streamChat(chatRequest).subscribe({
        next: async (chunk) => {
          try {
            const jsonChunk = JSON.parse(chunk);
            if (jsonChunk.isThoughtProcess === true && jsonChunk.isVerificationStep === false && jsonChunk.isFollowUpQuestion === false) {
              botMessage.isThoughtProcess = true;
              botMessage.isVerificationStep = false;
              if (jsonChunk.text && Array.isArray(jsonChunk.text)) {
                jsonChunk.text.forEach((textItem: any) => {
                  if (textItem.text) {
                    if (botMessage.text && botMessage.text.length > 0) {
                      botMessage.text += '\n';
                    }
                    botMessage.text = this.processMarkdownText(textItem.text);
                  }
                });
              }
              this.cdr.detectChanges();
            } else if (jsonChunk.isThoughtProcess === false && jsonChunk.isVerificationStep === false && jsonChunk.isFollowUpQuestion === false) {
              botMessage.isThoughtProcess = false;
              botMessage.isVerificationStep = true;
              botMessage.chatId = jsonChunk.chatId;
              botMessage.textChunks = [];
              if (jsonChunk.text && Array.isArray(jsonChunk.text)) {
                jsonChunk.text.forEach((textItem: any) => {
                  botMessage.textChunks!.push({
                    imageUrl: textItem.imageUrl || '',
                    text: this.processMarkdownText(textItem.text || ''),
                    imageName: textItem.imageName || ''
                  });
                  if (textItem.imageUrl) {
                    botMessage.pendingImages!.add(textItem.imageUrl);
                  }
                });
              }
            } else if (jsonChunk.isVerificationStep === true && jsonChunk.isFollowUpQuestion === false) {
              let str = jsonChunk.supportingImages;
              str = str.replace(/^\[|\]$/g, '').trim();
              const arr = str ? [str] : [];
              botMessage.supportingImages = arr;
              botMessage.isVerificationStep = true;
              botMessage.messageId = jsonChunk.messageId;
              this.cdr.detectChanges();
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        },
        complete: () => {
          this.previewIsSendingMessage = false;
          if (botMessage.isVerificationStep && botMessage.textChunks && botMessage.textChunks.length > 0) {
            const finalText = botMessage.textChunks.map(chunk => chunk.text).join('\n');
            this.previewMessages.push({
              text: finalText,
              isBot: true,
              timestamp: new Date()
            });
          } else if (botMessage.text) {
            this.previewMessages.push({
              text: botMessage.text,
              isBot: true,
              timestamp: new Date()
            });
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error in stream chat:', error);
          botMessage.text = 'Sorry, I encountered an error. Please try again.';
          this.previewIsSendingMessage = false;
          this.previewMessages.push({
            text: botMessage.text,
            isBot: true,
            timestamp: new Date()
          });
          this.cdr.detectChanges();
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      botMessage.text = 'Sorry, I encountered an error. Please try again.';
      this.previewIsSendingMessage = false;
      this.previewMessages.push({
        text: botMessage.text,
        isBot: true,
        timestamp: new Date()
      });
      this.cdr.detectChanges();
    }
  }

  processMarkdownText(text: string): string {
    // Simple markdown processing - you can enhance this as needed
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  onPreviewKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(this.previewCurrentMessage);
    }
  }

  applicationName = '';

  isDropdownOpen: boolean = false;
  applicationId: number | null = null;
  modules: ApplicationModuleModel[] = [];
  modulesFound: number = 0;
  articlesGenerated: number = 0;
  allApplications: ApplicationListingModel[] = [];
  selectApplication(app: ApplicationListingModel): void {
    this.isDropdownOpen = false;
    // Find the full application data from the current applications list if available
    const fullAppData = this.allApplications.find(a => a.id === app.id);

    // Navigate to the selected application's detail page
    this.router.navigate(['/apps', app.name, 'dashboard'], {
      state: {
        applicationData: {
          ...fullAppData || app,
          // Preserve any additional data if switching from current app
          modules: app.id === parseInt(String(this.applicationId)) ? this.modules : [],
          moduleCount: app.id === parseInt(String(this.applicationId)) ? this.modulesFound : 0,
          articlesCount: app.id === parseInt(String(this.applicationId)) ? this.articlesGenerated : 0,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }

  createNewApplication(): void {
    this.isDropdownOpen = false;
    // Navigate back to main dashboard to create new application
    this.router.navigate(['/apps']);
  }

  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.navigationTabs.forEach(t => t.active = (t.name === tabName));

    if (!this.applicationName) { return; }

    if (tabName === 'Dashboard') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard']);
    } else if (tabName === 'Modules') {
      this.router.navigate(['/apps', this.applicationName, 'modules']);
    }
    // Other tabs can be wired later when routes are available
  }

  private syncActiveTabFromUrl(): void {
    const url = this.router.url || '';
    let tab: string = 'Settings';
    if (url.includes('/dashboard')) { tab = 'Dashboard'; }
    else if (url.includes('/modules')) { tab = 'Modules'; }
    else if (url.includes('/settings')) { tab = 'Settings'; }
    else if (url.includes('/ama')) { tab = 'AMA'; }
    this.activeTab = tab;
    this.navigationTabs.forEach(t => t.active = (t.name === tab));
  }

  navigationTabs = [
    { name: 'Dashboard', active: false },
    { name: 'Modules', active: false },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Settings', active: true }
  ];

}
