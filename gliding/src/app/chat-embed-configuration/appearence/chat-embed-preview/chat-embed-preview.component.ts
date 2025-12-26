import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { WidgetConfiguration, ColorPickerField } from '../../appearance-cofig.model';

@Component({
  selector: 'app-chat-embed-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvatarModule
  ],
  templateUrl: './chat-embed-preview.component.html',
  styleUrl: './chat-embed-preview.component.scss'
})
export class ChatEmbedPreviewComponent implements OnChanges {
  @Input() widgetConfig: WidgetConfiguration;

  // Sample messages for preview
  sampleMessages = [
    {
      text: 'Hello! How can I get started?',
      isUser: true,
      timestamp: new Date()
    },
    {
      text: 'I\'d be happy to help you get started! What specific area would you like to know more about?',
      isUser: false,
      timestamp: new Date(),
      isVerificationStep: true,
      textChunks: [
        {
          text: 'I\'d be happy to help you get started! What specific area would you like to know more about?',
          imageUrl: '',
          imageName: ''
        }
      ]
    }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widgetConfig']) {
      // React to configuration changes
      console.log('Widget config updated in preview:', this.widgetConfig);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  isGradientColor(color: string): boolean {
    return color && (color.includes(' to ') || color.includes('linear-gradient'));
  }

  getGradientStyle(color: string): string {
    if (color.includes('linear-gradient')) {
      return color;
    }
    if (color.includes(' to ')) {
      const colors = color.split(' to ').map(c => c.trim());
      return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    }
    return color;
  }

  getBackgroundStyle(colorField: ColorPickerField | string): any {
    if (!colorField) { return {}; }

    let color: string;
    if (typeof colorField === 'string') {
      color = colorField;
    } else {
      // Handle ColorPickerField object
      if (colorField.type === 'gradient' && colorField.from && colorField.to) {
        color = `${colorField.from} to ${colorField.to}`;
      } else if (colorField.type === 'css' && colorField.css) {
        color = colorField.css;
      } else {
        color = colorField.value || '';
      }
    }

    if (!color) { return {}; }
    if (this.isGradientColor(color)) {
      return { 'background': this.getGradientStyle(color) };
    }
    return { 'background-color': color };
  }

  getHeaderBackground(colorField: ColorPickerField | string): any {
    if (!colorField) { return {}; }

    let color: string;
    if (typeof colorField === 'string') {
      color = colorField;
    } else {
      // Handle ColorPickerField object
      if (colorField.type === 'gradient' && colorField.from && colorField.to) {
        color = `${colorField.from} to ${colorField.to}`;
      } else if (colorField.type === 'css' && colorField.css) {
        color = colorField.css;
      } else {
        color = colorField.value || '';
      }
    }

    if (!color) { return {}; }
    if (this.isGradientColor(color)) {
      return { 'background': this.getGradientStyle(color) + ' !important' };
    }
    return { 'background-color': color + ' !important' };
  }

  getColorValue(colorField: ColorPickerField | string): string {
    if (!colorField) { return ''; }

    if (typeof colorField === 'string') {
      return colorField;
    } else {
      // Handle ColorPickerField object
      if (colorField.type === 'gradient' && colorField.from && colorField.to) {
        return `${colorField.from} to ${colorField.to}`;
      } else if (colorField.type === 'custom' && colorField.css) {
        return colorField.css;
      } else {
        return colorField.value || '';
      }
    }
  }
}
