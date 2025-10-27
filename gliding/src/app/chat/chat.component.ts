import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {ActivatedRoute} from '@angular/router';
import {ChatService} from './chat.service';
import {ChatMessage, ChatModel} from './chat.model';
import {InputText} from 'primeng/inputtext';

@Component({
  standalone: true,
  selector: 'app-chat',
  imports: [
    Button,
    InputText
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  appId: string;
  userId = 1;
  selectedChatId: number;
  isNewChatActive: boolean;
  currentChatMessages: ChatMessage[] = [];


  chatHistory: ChatModel[];
  constructor(    private route: ActivatedRoute,
                  private chatService: ChatService) {
  }

  ngOnInit() {
    console.log('cjnbwjhc');
    this.appId = this.route.snapshot.paramMap.get('id')!;
    this.loadChatHistory();
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
  }}

  // selectChat(chat: ChatModel  ) {
  //   this.selectedChatId = chat.chatId;
  //   this.isNewChatActive = false;
  //   this.loadChatMessages(chat.chatId);
  // }

  // loadChatMessages(chatId: number) {
  //   this.chatService.getChatMessages(chatId).subscribe({
  //     next:  (messages) => {
  //     this.currentChatMessages = [];
  //       messages.forEach((msg, index) => {
  //         const botMessage: ChatMessage = {
  //           text: '',
  //           isUser: false,
  //           timestamp: new Date(msg.createdAt),
  //           textChunks: [],
  //           pendingImages: new Set(),
  //           isThoughtProcess: false,
  //           isVerificationStep: false,
  //           supportingImages: [],
  //           id: msg.id.toString(),
  //           userQuestion: ''
  //         };
  //         if (msg.userType === 'USER') {
  //           const userMessage: ChatMessage = {
  //             text: msg.message,
  //             isUser: true,
  //             timestamp: new Date(msg.createdAt),
  //             id: msg.id.toString()
  //           };
  //       }
  //   }
//     });
//   //
//   }
//
// }

