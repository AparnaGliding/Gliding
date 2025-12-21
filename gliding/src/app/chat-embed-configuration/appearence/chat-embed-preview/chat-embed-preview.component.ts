import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerField } from '../../appearance-cofig.model';

@Component({
  selector: 'app-chat-embed-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-embed-preview.component.html',
  styleUrl: './chat-embed-preview.component.scss'
})
export class ChatEmbedPreviewComponent {
  @Input() showHeader: boolean = true;
  @Input() mode: 'Light' | 'Dark' = 'Light';
  @Input() headerColor!: ColorPickerField;
  @Input() contentAreaColor!: ColorPickerField;
  @Input() textAreaColor!: ColorPickerField;
  @Input() userMessageBackground!: ColorPickerField;
  @Input() botMessageBackground!: ColorPickerField;
  @Input() borderColor!: ColorPickerField;

  // Sample messages for preview
  sampleMessages = [
    {
      text: "Hi! How can I help you today?",
      isUser: false,
      timestamp: new Date()
    },
    {
      text: "I'd be happy to help you with your order. Could you please provide your order number?",
      isUser: true,
      timestamp: new Date()
    },
    {
      text: "I need help with my order",
      isUser: false,
      timestamp: new Date()
    }
  ];

  getColorValue(colorField: ColorPickerField): string {
    if (!colorField) return '#ffffff';

    switch (colorField.selectedColorMode) {
      case 'solid':
        return colorField.solidColor || '#ffffff';
      case 'gradient':
        const from = colorField.gradientFrom || '#ffffff';
        const to = colorField.gradientTo || '#f0f0f0';
        return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
      case 'custom':
        return colorField.customValue || '#ffffff';
      default:
        return '#ffffff';
    }
  }

  getBackgroundStyle(colorField: ColorPickerField): any {
    const colorValue = this.getColorValue(colorField);

    if (colorValue.includes('linear-gradient') || colorValue.includes('gradient')) {
      return { 'background': colorValue };
    }
    return { 'background-color': colorValue };
  }

  isGradientColor(colorValue: string): boolean {
    return colorValue && (colorValue.includes('gradient') || colorValue.includes(' to '));
  }
}
