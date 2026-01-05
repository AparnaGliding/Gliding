import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-icon',
  standalone: true,
  imports: [],
  templateUrl: './chat-icon.component.html',
  styleUrl: './chat-icon.component.scss'
})
export class ChatIconComponent {

  openWidget() {
    console.log('Chat icon clicked - sending OPEN_WIDGET message');
    window.parent.postMessage(
      { type: 'OPEN_WIDGET' },
      '*'
    );
  }
}
