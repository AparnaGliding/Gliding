import {Button} from 'primeng/button';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from './chat.service';
import {ChatMessage, ChatModel, ChatRequest, ApplicationModuleModel, ArticleListResponseModel} from './chat.model';
import {KnowledgeHubService} from '../knowledge-hub/services/knowledge-hub.service';
import {ListCategoryModel, ListFolderModel} from '../knowledge-hub/knowledge-hub.model';
import {ReferencableType, DirectoryItemType} from '../knowledge-hub/models/knowledge-hub.models';
import {InputText} from 'primeng/inputtext';
import {NgClass, NgIf, NgFor, CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Textarea} from 'primeng/textarea';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, HostListener} from '@angular/core';
import {Subscription, lastValueFrom} from 'rxjs';


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
    Textarea,
    ProgressSpinner
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  appId: string;
  userId = 1;
  selectedChatId: string | null = null;
  isNewChatActive: boolean = false;
  userQuestion = '';
  currentChatMessages: ChatMessage[] = [];
  currentMessage: string;
  isSendingMessage = false;
  loadingChatHistory = false;
  isCreatingNewChat = false;
  app: any;


  chatHistory: ChatModel[];
  modules: ApplicationModuleModel[] = [];
  articles: ArticleListResponseModel[] = [];
  selectedModule: string = '';
  private hasUnsavedChatChanges = false;
  private isTyping = false;
  private currentStreamSub?: Subscription;
  private maxChatId = 0;

  // Add to Article modal properties
  showAddToArticleModal = false;
  categories: ListCategoryModel[] = [];
  folders: ListFolderModel[] = [];
  selectedCategoryId: number | null = null;
  selectedFolderId: number | null = null;
  modalLoading = false;
  selectedMessageForArticle: ChatMessage | null = null;

  constructor(private route: ActivatedRoute,
              private chatService: ChatService,
              private cdr: ChangeDetectorRef,
              private knowledgeHubService: KnowledgeHubService
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
    // Start with new chat active by default
    this.isNewChatActive = true;
  }

  loadChatHistory() {
    this.loadingChatHistory = true;
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

        // Find the largest chat ID and store it
        this.maxChatId = this.chatHistory.length > 0
          ? Math.max(...this.chatHistory.map(chat => chat.chatId))
          : 0;

        // Update the chat service with the next available ID
        this.chatService.setNextChatId(this.maxChatId + 1);

        this.loadingChatHistory = false;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.loadingChatHistory = false;
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

  startNewChat() {
    this.isCreatingNewChat = true;

    // Generate a temporary chat ID for the new conversation
    const tempChatId = this.chatService.getNextChatId();

    // Create a temporary chat entry in history
    const newChatEntry = {
      chatId: parseInt(tempChatId),
      title: 'New Chat',
      modifiedAt: 'just now'
    };

    // Add to beginning of chat history
    if (!this.chatHistory) {
      this.chatHistory = [];
    }
    this.chatHistory.unshift(newChatEntry);

    // Set as selected and active
    this.selectedChatId = tempChatId;
    this.isNewChatActive = true;
    this.currentChatMessages = [];
    this.currentMessage = '';
    this.hasUnsavedChatChanges = false;
    this.isCreatingNewChat = false;
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
      message.supportingImages
    ) {
      console.log(message);
      message.textChunks.forEach((chunk) => {
        const imageIdentifier = chunk.imageUrl;
        if (imageIdentifier && message.pendingImages?.has(imageIdentifier)) {
          const isSupported = message.supportingImages.includes(imageIdentifier);
          console.log('isSupported:', isSupported);

          if (true) {
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
    console.log('bhwhq');
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
      this.isNewChatActive = false; // Switch from welcome to chat view
    }

    // Update the chat title in history with the first message
    if (this.chatHistory && this.selectedChatId) {
      const chatIndex = this.chatHistory.findIndex(chat => chat.chatId.toString() === this.selectedChatId);
      if (chatIndex !== -1) {
        this.chatHistory[chatIndex].title = text.length > 50 ? text.substring(0, 50) + '...' : text;
      }
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
          if (jsonChunk.isThoughtProcess === true && jsonChunk.isVerificationStep === false && jsonChunk.isFollowUpQuestion === false) {
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
                  botMessage.pendingImages.add(textItem.imageUrl);
                } else {
                  console.log('textItem.imageUrl is falsy:', textItem.imageUrl);
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
    this.chatService.getArticles(1, this.userId, 0, 5).subscribe({
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

  getSelectedChatTitle(): string {
    if (this.selectedChatId && this.chatHistory) {
      const selectedChat = this.chatHistory.find(chat => chat.chatId.toString() === this.selectedChatId);
      return selectedChat?.title || 'New Chat';
    }
    return 'New Chat';
  }

  formatMessageTime(timestamp: Date): string {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString();
  }

  trackByChatId(index: number, chat: ChatModel): number {
    return chat.chatId;
  }

  downloadResponse(message: ChatMessage): void {
    // Implementation for download functionality
    console.log('Download response:', message);
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

  // Add to Article modal methods
  openAddToArticleModal(message?: ChatMessage): void {
    this.selectedMessageForArticle = message || null;
    this.showAddToArticleModal = true;
    this.selectedCategoryId = null;
    this.selectedFolderId = null;
    this.categories = [];
    this.folders = [];
    this.loadCategories();
  }

  closeAddToArticleModal(): void {
    this.showAddToArticleModal = false;
    this.selectedMessageForArticle = null;
  }

  loadCategories(): void {
    this.modalLoading = true;
    // Use Knowledge Hub API instead of Freshdesk API
    this.knowledgeHubService.getAllCategories(ReferencableType.ARTICLE).subscribe({
      next: (categories) => {
        // Map the response to match the expected format
        this.categories = categories.map(category => ({
          id: category.id,
          name: category.name
        }));
        this.modalLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.modalLoading = false;
      }
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.selectedFolderId = null;
    this.folders = [];

    if (categoryId) {
      this.loadFoldersForCategory(categoryId);
    }
  }

  loadFoldersForCategory(categoryId: number): void {
    this.modalLoading = true;

    // Use Knowledge Hub API to get items by category and filter for folders only
    this.knowledgeHubService.getItemsByCategory(categoryId).subscribe({
      next: (items) => {
        // Filter only folder items and map to the expected format
        this.folders = items
          .filter(item => item.itemType === DirectoryItemType.FOLDER) // Only get folders
          .map(folder => ({
            id: folder.id,
            name: folder.name
          }));
        this.modalLoading = false;
      },
      error: (error) => {
        console.error('Error loading folders:', error);
        this.modalLoading = false;
      }
    });
  }

  async confirmAddToArticle(): Promise<void> {
    if (!this.selectedCategoryId || !this.selectedFolderId || !this.selectedMessageForArticle) {
      return;
    }
    this.modalLoading = true;
    try {
      const name = this.buildSuggestedFileName(this.selectedMessageForArticle);
      const file = await this.renderMessageToPdfMake(this.selectedMessageForArticle, name);
      this.chatService.uploadFile(
        file,
        `${name}.pdf`,
        this.selectedFolderId,
        this.selectedCategoryId,
        this.userId,
        this.app?.id,
        false,
        true
      ).subscribe({
        next: () => {
          this.modalLoading = false;
          // refresh generated articles list
          this.loadArticles();
          this.closeAddToArticleModal();
          alert('Content exported to PDF and uploaded successfully.');
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.modalLoading = false;
          alert('Upload failed. Check console for details.');
        }
      });
    } catch (e) {
      console.error('PDF generation failed', e);
      this.modalLoading = false;
      alert('PDF generation failed. Make sure required libraries are installed.');
    }
  }

  private buildSuggestedFileName(message: any): string {
    let base = '';
    if (this.userQuestion) {
      base = String(this.userQuestion).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } else if (message?.userQuestion) {
      base = String(message.userQuestion).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } else if (message?.text) {
      base = String(message.text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    } else if (Array.isArray(message?.textChunks) && message.textChunks.length) {
      base = String(message.textChunks.map((c: any) => c.text).join(' ')).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
    if (!base) {
      base = 'Chat Export';
    }
    if (base.length > 60) {
      base = base.slice(0, 60).trim();
    }
    base = base.replace(/[^A-Za-z0-9]+/g, '_');
    base = base.replace(/_+/g, '_');
    base = base.replace(/^_+|_+$/g, '');
    return base;
  }

  private async renderMessageToPdfMake(message: any, name: string): Promise<File> {
    const pdfMakeMod: any = await import('pdfmake/build/pdfmake');
    const pdfFontsMod: any = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeMod.default || pdfMakeMod;
    const fonts = (pdfFontsMod && (pdfFontsMod.default || pdfFontsMod)) as any;
    let vfs = (pdfMake as any).vfs;
    if (!vfs) {
      vfs = fonts?.pdfMake?.vfs || fonts?.vfs;
    }
    if (!vfs) {
      const keys = Object.keys(fonts || {});
      const looksLikeRawMap = keys.some(k => /\.ttf$/i.test(k));
      if (looksLikeRawMap) {
        vfs = fonts;
      }
    }
    if (!vfs) {
      console.error('pdfmake vfs not found; module keys:', Object.keys(fonts || {}));
      throw new Error('pdfmake fonts (vfs) not found. Install pdfmake and ensure vfs_fonts is bundled.');
    }
    (pdfMake as any).vfs = vfs;

    const content: any[] = [];
    const toPlain = (html: string) => html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');

    if (message?.text) {
      content.push({ text: toPlain(message.text), margin: [0, 0, 0, 8] });
    }
    if (Array.isArray(message?.textChunks)) {
      for (const chunk of message.textChunks) {
        if (chunk?.text) {
          content.push({ text: toPlain(chunk.text), margin: [0, 6, 0, 6] });
        }
        if (chunk?.imageUrl) {
          try {
            const dataUrl = await this.resolveImageToDataURL(chunk.imageUrl);
            content.push({ image: dataUrl, width: 450, margin: [0, 6, 0, 12] });
          } catch {}
        }
      }
    }

    if (content.length === 0) {
      content.push({ text: ' ', margin: [0, 0, 0, 0] });
    }

    const docDefinition = {
      info: { title: name },
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content
    } as any;

    const blob: Blob = await new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBlob((b: Blob) => resolve(b));
    });
    return new File([blob], `${name}.pdf`, { type: 'application/pdf' });
  }

  private async resolveImageToDataURL(identifier: string): Promise<string> {
    const isAbsolute = /^(https?:)?\/\//i.test(identifier) || identifier.startsWith('data:') || identifier.startsWith('blob:');
    let objectUrl: string;
    if (isAbsolute) {
      objectUrl = identifier;
    } else {
      objectUrl = await lastValueFrom(this.chatService.checkAndGetScreenshotImage(identifier));
    }
    const res = await fetch(objectUrl, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategoryId) return '';
    const category = this.categories.find(c => c.id === this.selectedCategoryId);
    return category ? category.name : '';
  }

  getSelectedFolderName(): string {
    if (!this.selectedFolderId) return '';
    const folder = this.folders.find(f => f.id === this.selectedFolderId);
    return folder ? folder.name : '';
  }
}
