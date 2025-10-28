import {Button} from 'primeng/button';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from './chat.service';
import {ChatMessage, ChatModel, ChatRequest, ApplicationModuleModel, ArticleListResponseModel} from './chat.model';
import {InputText} from 'primeng/inputtext';
import {NgClass, NgIf, NgFor, CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, HostListener} from '@angular/core';
import {Subscription} from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [
    Button,
    NgClass,
    NgIf,
    NgFor,
    CommonModule,
    FormsModule,
    Textarea
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  appId: string;
  userId = 1;
  selectedChatId: string | null = null;
  isNewChatActive: boolean;
  userQuestion = '';
  currentChatMessages: ChatMessage[] = [];
  currentMessage: string;
  isSendingMessage = false;
  app: any;


  chatHistory: ChatModel[];
  modules: ApplicationModuleModel[] = [];
  articles: ArticleListResponseModel[] = [];
  selectedModule: string = '';
  private hasUnsavedChatChanges = false;
  private isTyping = false;
  private currentStreamSub?: Subscription;

  constructor(private route: ActivatedRoute,
              private chatService: ChatService,
              private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.appId = this.route.snapshot.paramMap.get('id')!;
    this.loadChatHistory();
    this.app = {
      id : 1 ,
      name : 'Terzo',
      domain : 'Terzo_Cloud_Contracts_final'
    };
    this.loadModules();
    this.loadArticles();
  }

  loadChatHistory() {
    this.chatService.getHistory(this.appId, this.userId, 0, 50).subscribe({
      next: (chatHistory) => {
        this.chatHistory = chatHistory.map(chat => {
          const modifiedAt = new Date(chat.modifiedAt); // convert string → Date
          const dateOnly = new Date(
            modifiedAt.getFullYear(),
            modifiedAt.getMonth(),
            modifiedAt.getDate()
          );
          return {
            chatId: chat.chatId,
            title: chat.title,
            modifiedAt: this.getRelativeDate(dateOnly)
          };
        });
      }
    });
  }


  getRelativeDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const compareToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const compareYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    if (compareDate.getTime() === compareToday.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === compareYesterday.getTime()) {
      return '1 day ago';
    } else {
      const diffTime = compareToday.getTime() - compareDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return years === 1 ? '1 year ago' : `${years} years ago`;
      }
    }
  }

  selectChat(chat: ChatModel ) {
    this.selectedChatId = chat.chatId.toString();
    this.isNewChatActive = false;
    this.loadChatMessages(chat.chatId);
  }

  processMarkdownText(text: string): string {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>\n');
    text = text.replace(/\\n\\n\\n/g, '\n');
    text = text.replace(/\\n/g, '<br>');
    return text;
  }


  loadChatMessages(chatId: number) {
    this.chatService.getChatMessages(chatId).subscribe({
      next: (messages) => {
        this.currentChatMessages = [];
        messages.forEach((msg, index) => {
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
          if (msg.userType === 'USER') {
            const userMessage: ChatMessage = {
              text: msg.message,
              isUser: true,
              timestamp: new Date(msg.createdAt),
              id: msg.id.toString()
            };
            this.userQuestion = msg.message;
            this.currentChatMessages.push(userMessage);
          } else if (msg.userType === 'SYSTEM') {
            try {
              const jsonChunks = JSON.parse(msg.message);
              if (Array.isArray(jsonChunks)) {
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
                        } else {
                          console.log('textItem.imageUrl is falsy:', textItem.imageUrl);
                        }
                      });
                    }
                  } else if (chunk.isVerificationStep === true) {
                    let str = chunk.supportingImages;
                    // str = str.replace(/^\[|\]$/g, '').trim();
                    // const arr = str ? [str] : [];
                   botMessage.supportingImages = str;
                    botMessage.isVerificationStep = true;
                    botMessage.messageId = chunk.messageId;
                  }
                });
              }
              this.currentChatMessages.push(botMessage);
              this.replaceLoadingImagesWithActual(botMessage);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          }
        });
      }
    });
  }



  replaceLoadingImagesWithActual(message: ChatMessage) {
    if (
      message.textChunks &&
      Array.isArray(message.textChunks) &&
      Array.isArray(message.supportingImages)
    ) {
      message.textChunks.forEach((chunk) => {
        const imageIdentifier = chunk.imageUrl;
        if (imageIdentifier && message.pendingImages?.has(imageIdentifier)) {
          const isSupported = message.supportingImages.includes(imageIdentifier);
          console.log('isSupported:', isSupported);

          if (isSupported) {
            console.log('Calling checkAndGetScreenshotImage for:', imageIdentifier);
            this.chatService.checkAndGetScreenshotImage(imageIdentifier).subscribe({
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
  sendChatMessage() {
    if (!this.currentMessage.trim() || this.isSendingMessage) { return; }
    this.sendMessage(this.currentMessage);
  }

  async sendMessage(question?: string, domain?: string) {
    const text = question || this.currentMessage.trim();
    this.userQuestion = this.currentMessage;
    const userMessage: ChatMessage = {
      text: text,
      isUser: true,
      timestamp: new Date(),
    };
    this.currentChatMessages.push(userMessage);
    this.currentMessage = '';
    this.scrollToBottom();
    if (!this.selectedChatId) {
      this.selectedChatId = this.chatService.getNextChatId();
    }
    this.hasUnsavedChatChanges = true;
    const botMessage: ChatMessage = {
      text: '',
      isUser: false,
      timestamp: new Date(),
      textChunks: [],
      pendingImages: new Set(),
      isThoughtProcess: false,
      isVerificationStep: false,
    };
    this.currentChatMessages.push(botMessage);
    this.scrollToBottom();

    this.isTyping = true;
    this.isSendingMessage = true;

    // @ts-ignore
    const chatRequest: ChatRequest = {
      question: text,
      domain: this.app.domain,
      accountId: this.app?.id,
      userId: '1',
      chatId: this.selectedChatId || null

    };
    const sub = this.chatService.streamChat(chatRequest).subscribe({
      next: async (chunk) => {
        try {
          const jsonChunk = JSON.parse(chunk);
          if (jsonChunk.isThoughtProcess === true && jsonChunk.isVerificationStep === false) {
            botMessage.isThoughtProcess = true;
            botMessage.isVerificationStep = false;
            if (jsonChunk.text && Array.isArray(jsonChunk.text)) {
              jsonChunk.text.forEach((textItem: any) => {
                if (textItem.text) {
                  if (botMessage.text.length > 0) {
                    botMessage.text += '\n';
                  }
                  // Process markdown formatting
                  botMessage.text = this.processMarkdownText(textItem.text);
                }
              });
            }
            // Force UI update
            this.cdr.detectChanges();
        } else if (jsonChunk.isThoughtProcess === false && jsonChunk.isVerificationStep === false) {
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
                  botMessage.pendingImages.add(textItem.imageUrl);
                } else {
                  console.log('textItem.imageUrl is falsy:', textItem.imageUrl);
                }
              });
            }
          } else if (jsonChunk.isVerificationStep === true) {
            let str = jsonChunk.supportingImages;
            str = str.replace(/^\[|\]$/g, '').trim();
            const arr = str ? [str] : [];
            botMessage.supportingImages = arr;
            botMessage.isVerificationStep = true;
            botMessage.messageId = jsonChunk.messageId;
      this.currentChatMessages.push(botMessage);
      this.replaceLoadingImagesWithActual(botMessage);
      this.cdr.detectChanges();
    } } catch (error) {
      console.error('Error parsing message:', error);
    }
        this.scrollToBottom();
          },

      error: (err) => {
        console.error('Chat stream error:', err);
        botMessage.text = 'Sorry, there was an error processing your message.';
        this.isTyping = false;
        this.isSendingMessage = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isTyping = false;
        this.isSendingMessage = false;
        this.cdr.detectChanges();
        // Mark as having unsaved changes when message is complete
        this.hasUnsavedChatChanges = true;
      }
    });

    // Keep ref to unsubscribe on destroy
    this.currentStreamSub?.unsubscribe?.();
    this.currentStreamSub = sub;
  }
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatMessages) {
        this.chatMessages.nativeElement.scrollTop =
          this.chatMessages.nativeElement.scrollHeight;
      }
    }, 100);
  }

  loadModules() {
    this.chatService.getModulesForApplication(1).subscribe({
      next: (modules) => {
        this.modules = modules.filter(m => m.moduleName !== 'Product Overview');
        this.selectedModule = `${this.app.name} (All Modules)`;
      },
      error: (err) => {
        console.error('Error loading modules:', err);
      }
    });
  }

  loadArticles() {
    this.chatService.getArticles(1, this.userId, 0, 3).subscribe({
      next: (articles) => {
        this.articles = articles;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
      }
    });
  }

  onModuleChange(event: any) {
    this.selectedModule = event.target.value;
  }
}
