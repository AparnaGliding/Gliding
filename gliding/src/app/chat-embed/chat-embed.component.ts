import {ChangeDetectorRef, Component, OnInit, OnDestroy} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {Button} from 'primeng/button';
import {ApplicationModuleModel, ChatMessage} from '../chat/chat.model';
import {ChatRequest} from './model/chats.model';
import {ChatEmbedService} from './chat-embed.service';
import {Subscription} from 'rxjs';
import {NgClass, NgStyle} from '@angular/common';
import {ApplicationListingModel, WidgetResponseModel} from './chat-embed.model';
import { AvatarModule } from 'primeng/avatar';



@Component({
  selector: 'app-chat-embed',
    imports: [
        ReactiveFormsModule,
        Textarea,
        Button,
        FormsModule,
        NgClass,
        NgStyle,
        AvatarModule,
    ],
  templateUrl: './chat-embed.component.html',
  styleUrl: './chat-embed.component.scss'
})
export class ChatEmbedComponent implements OnInit, OnDestroy {
    constructor(private chatEmbedService: ChatEmbedService,
                private cdr: ChangeDetectorRef,
    ) {}
    question: string;
    widgetId: string;
    createchatModel: ChatRequest = {
        question: '',
        domain: '',
        applicationId: '',
        externalUserId: '',
        chatId: '',
        applicationModuleId: 0
    };
    currentChatMessages: ChatMessage[] = [];
    private currentStreamSub?: Subscription;
    currentMessage?: string;
    configuration: WidgetResponseModel;
    externalUserId?: string;
    chatId: string;
    isSendingMessage = false;
    isTyping = false;
    applicationId: string;
    domain: string;
    ischatOpen = false;

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.widgetId = urlParams.get('widgetId');
    this.widgetId = '1';
    this.externalUserId = urlParams.get('userId');
    this.externalUserId = '1';
      this.loadConfigurations(this.widgetId);
  }

  ngOnDestroy(): void {
    this.currentStreamSub?.unsubscribe();
  }

  getApplicationDetails(appId: string) {
    this.chatEmbedService.getApplicationDetails(appId).subscribe({
        next: (res: ApplicationListingModel) => {
            this.domain = res.domain;
        },
        error: (err) => console.error('Failed to load config', err),
    });
  }

  createNewChat() {
      console.log(this.applicationId);
      this.createchatModel.applicationId = this.applicationId;
      this.createchatModel.externalUserId = this.externalUserId;
      this.createchatModel.applicationModuleId = 0;
      this.chatEmbedService.createNewChat(this.createchatModel).subscribe({
          next: (res: string) => {
              this.chatId = res;
              this.loadChatHistory();
              return res;
          },
          error: (err) => {
              console.error('Failed to create new chat', err);
          }
      });
  }

  getLatestChatId( appId: string , userId: string) {
      this.chatEmbedService.getLatestChatId(appId , userId).subscribe({
          next: (res: string) => {
              this.chatId = res;
              this.loadChatHistory();

          },
          error: (err) => console.error('Failed to load config', err),
      });
  }

    loadConfigurations(widgetId: string) {
        this.chatEmbedService.getConfigurationForWidget(widgetId).subscribe({
            next: (res) => {this.configuration = res;
                this.applicationId = this.configuration.applicationId;
                this.getApplicationDetails(this.configuration.applicationId);
                this.getLatestChatId(this.configuration.applicationId , this.externalUserId); },
            error: (err) => console.error('Failed to load config', err),
        });
    }

    loadChatHistory() {
        this.chatEmbedService.getChatMessages(parseInt(this.chatId)).subscribe({
            next: (messages) => {
                this.currentChatMessages = [];
                messages.forEach((msg) => {
                    if (msg.userType === 'USER') {
                        const userMessage: ChatMessage = {
                            text: msg.message,
                            isUser: true,
                            timestamp: new Date(msg.createdAt),
                            id: msg.id.toString()
                        };
                        this.currentChatMessages.push(userMessage);
                    } else if (msg.userType === 'SYSTEM') {
                        try {
                            const jsonChunks = JSON.parse(msg.message);
                            if (Array.isArray(jsonChunks)) {
                                const botMessage: ChatMessage = {
                                    text: '',
                                    isUser: false,
                                    timestamp: new Date(msg.createdAt),
                                    textChunks: [],
                                    pendingImages: new Set(),
                                    isThoughtProcess: false,
                                    isVerificationStep: false,
                                    supportingImages: [],
                                    id: msg.id.toString(),
                                    userQuestion: ''
                                };
                                jsonChunks.forEach((chunk: any) => {
                                    if (chunk.isThoughtProcess === false && chunk.isVerificationStep === false) {
                                        botMessage.isThoughtProcess = false;
                                        botMessage.isVerificationStep = true;
                                        botMessage.chatId = chunk.chatId;
                                        botMessage.textChunks = [];
                                        if (chunk.text && Array.isArray(chunk.text)) {
                                            chunk.text.forEach((textItem: any) => {
                                                botMessage.textChunks!.push({
                                                    imageUrl: textItem.imageUrl || '',
                                                    text: this.processMarkdownText(textItem.text || ''),
                                                    imageName: textItem.imageName || ''
                                                });
                                                if (textItem.imageUrl) {
                                                    botMessage.pendingImages.add(textItem.imageUrl);
                                                }
                                            });
                                        }
                                    } else if (chunk.isVerificationStep === true) {
                                        botMessage.supportingImages = chunk.supportingImages;
                                        botMessage.isVerificationStep = true;
                                        botMessage.messageId = chunk.messageId;
                                        this.replaceLoadingImagesWithActual(botMessage);
                                    }
                                });
                                this.currentChatMessages.push(botMessage);
                            }
                        } catch (error) {
                            console.error('Error parsing message:', error);
                        }
                    }
                });
            },
            error: (error) => {
                console.error('Error loading chat history:', error);
            }
        });
    }


  sendMessage(question?: string) {
      if (!this.currentMessage?.trim() || this.isSendingMessage) {
          return;
      }

      question = this.currentMessage;
      const userMessage: ChatMessage = {
          text: question,
          isUser: true,
          timestamp: new Date(),
      };
      this.currentChatMessages.push(userMessage);
      this.currentMessage = '';
      this.isSendingMessage = true;
      this.isTyping = true;

      const chatRequest: ChatRequest = {
          question: question,
          domain: 'Terzo_Cloud_Contracts_final',
          applicationId: '1',
          externalUserId : this.externalUserId,
          chatId: this.chatId,
          applicationModuleId: 1
      };
      let botMessage: ChatMessage | null = null;

      const sub = this.chatEmbedService.streamChat(chatRequest).subscribe({
          next: async (chunk) => {
              try {
                  const jsonChunk = JSON.parse(chunk);
                  if (!botMessage) {
                      this.isSendingMessage = false;
                      botMessage = {
                          text: '',
                          isUser: false,
                          timestamp: new Date(),
                          textChunks: [],
                          pendingImages: new Set(),
                          isThoughtProcess: false,
                          isVerificationStep: false,
                      };
                      this.currentChatMessages.push(botMessage);
                      this.cdr.detectChanges();
                  }
                  if (jsonChunk.isThoughtProcess === true && jsonChunk.isVerificationStep === false && jsonChunk.isFollowUpQuestion === false) {
                      botMessage.isThoughtProcess = true;
                      botMessage.isVerificationStep = false;
                      if (jsonChunk.text && Array.isArray(jsonChunk.text)) {
                          jsonChunk.text.forEach((textItem: any) => {
                              if (textItem.text) {
                                  if (botMessage!.text.length > 0) {
                                      botMessage!.text += '\n';
                                  }
                                  botMessage!.text = this.processMarkdownText(textItem.text);
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
                              botMessage!.textChunks!.push({
                                  imageUrl: textItem.imageUrl || '',
                                  text: this.processMarkdownText(textItem.text || ''),
                                  imageName: textItem.imageName || ''
                              });
                              if (textItem.imageUrl) {
                                  botMessage!.pendingImages.add(textItem.imageUrl);
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
                      this.replaceLoadingImagesWithActual(botMessage);
                      this.cdr.detectChanges();
                  } else if (jsonChunk.isFollowUpQuestion === true) {
                      botMessage.isFollowUpQuestion = true;
                      if (jsonChunk.followUpQuestions) {
                          const questionsString = jsonChunk.followUpQuestions;
                          botMessage.followUpQuestions = questionsString.split('|').map((q: string) => q.trim());
                      }
                      this.cdr.detectChanges();
                  }
              } catch (error) {
                  console.error('Error parsing message:', error);
              }
          },
          error: (err) => {
              console.error('Chat stream error:', err);
              if (botMessage) {
                  botMessage.text = 'Sorry, there was an error processing your message.';
              }
              this.isTyping = false;
              this.isSendingMessage = false;
              this.cdr.detectChanges();
          },
          complete: () => {
              this.isTyping = false;
              this.isSendingMessage = false;
              this.cdr.detectChanges();
          }
      });
      this.currentStreamSub?.unsubscribe?.();
      this.currentStreamSub = sub;
  }

  processMarkdownText(text: string): string {
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>\n');
      text = text.replace(/\\n\\n\\n/g, '\n');
      text = text.replace(/\\n/g, '<br>');
      return text;
  }

  onEnterPress(event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          this.sendMessage();
      }
  }

  replaceLoadingImagesWithActual(message: ChatMessage) {
      if (
          message.textChunks &&
          Array.isArray(message.textChunks) &&
          message.supportingImages
      ) {
          message.textChunks.forEach((chunk) => {
              const imageIdentifier = chunk.imageUrl;
              if (imageIdentifier && message.pendingImages?.has(imageIdentifier)) {
                  const isSupported = message.supportingImages.includes(imageIdentifier);

                  if (chunk.imageUrl && message.pendingImages?.has(chunk.imageUrl)) {
                      this.chatEmbedService.checkAndGetScreenshotImage(imageIdentifier).subscribe({
                          next: (objectUrl: string) => {
                              chunk.imageUrl = objectUrl;
                              message.pendingImages?.delete(imageIdentifier);
                              this.cdr.detectChanges();
                          },
                          error: () => {
                              message.pendingImages?.delete(imageIdentifier);
                              chunk.imageUrl = '';
                              this.cdr.detectChanges();
                          }
                      });
                  } else {
                      message.pendingImages?.delete(imageIdentifier);
                  }
              }
          });
      }
  }

  onImageLoad(message: ChatMessage, imageUrl: string): void {
      if (message.pendingImages) {
          message.pendingImages.delete(imageUrl);
      }
  }

  onImageError(message: ChatMessage, imageUrl: string): void {
      if (message.pendingImages) {
          message.pendingImages.delete(imageUrl);
      }
  }

  openImageInNewTab(imageUrl: string): void {
      window.open(imageUrl, '_blank');
  }

    toggleChat() {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CLOSE_ASSISTQ_WIDGET' }, '*');
        }
    }

    askFollowUpQuestion(question: string): void {
        this.currentMessage = question;
        this.sendMessage();
    }




}
