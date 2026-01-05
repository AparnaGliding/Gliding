import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Card} from 'primeng/card';
import {FormsModule} from '@angular/forms';
import {ConfigurationCardComponent} from './configuration-card/configuration-card.component';
import {ChatEmbedPreviewComponent} from './chat-embed-preview/chat-embed-preview.component';
import {CardSection, WidgetConfiguration} from '../appearance-cofig.model';

@Component({
  selector: 'app-appearance',
  imports: [
    Card,
    FormsModule,
    ConfigurationCardComponent,
    ChatEmbedPreviewComponent
  ],
  templateUrl: './appearence.component.html',
  styleUrl: './appearence.component.scss'
})
export class AppearenceComponent {
  items = ['Appearance', 'Branding', 'Layout', 'Content'];
  activeItem = 'Appearance';
  @Input() widgetConfig: WidgetConfiguration;
  @Output() saveConfiguration = new EventEmitter<WidgetConfiguration>();
  @Output() discardConfiguration = new EventEmitter<void>();

  onSaveChanges(widgetConfig: WidgetConfiguration) {
    this.saveConfiguration.emit(widgetConfig);
  }

  onDiscardChanges() {
    this.discardConfiguration.emit();
  }

  setActive(item: string) {
    this.activeItem = item;
  }

  section: CardSection[] = [
    {
      id: 'header',
      title: 'Header',
      collapsed: false,
      fields: [
        {
          id: 'headerNeeded',
          type: 'toggle',
          label: 'Show Header',
          // value: true
        },
        {
          id: 'headerColor',
          type: 'color-picker',
          label: 'Header Color',
          options : ['solid' , 'gradient' , 'Custom(CSS)']
        },
      ]},
    {
      id: 'colors',
      title: 'Colors',
      collapsed: false,
      fields: [
        {
          id: 'backgroundColor',
          type: 'color-picker',
          label: 'Content Area Color',
          options: ['solid', 'gradient', 'Custom(CSS)']
        },
        {
          id: 'buttonColor',
          type: 'color-picker',
          label: 'Button Color',
          options: ['solid', 'gradient', 'Custom(CSS)']
        },
        {
          id: 'userMessageColour',
          type: 'color-picker',
          label: 'User Message Background',
          options: ['solid', 'gradient', 'Custom(CSS)']
        },
        {
          id: 'botMessageColour',
          type: 'color-picker',
          label: 'Bot Message Background',
          options: ['solid', 'gradient', 'Custom(CSS)']
        },
        {
          id: 'headerTextColour',
          type: 'color-picker',
          label: 'headerTextColour',
          options: ['solid', 'gradient', 'Custom(CSS)']
        },
        {
          id: 'textColor',
          type: 'color-picker',
          label: 'Text Color',
          options: ['solid', 'gradient', 'Custom(CSS)']
        }
      ]
    },
    {
      id: 'Mode',
      title: 'Mode',
      collapsed: false,
      fields: [
        {
          id: 'mode',
          type: 'radio',
          label: '',
          options: ['LIGHT' , 'DARK' , 'AUTO']
        }]
    },
    {
      id: 'Branding',
      title: 'logo',
      collapsed: false,
      fields: [
        {
          id: 'logoType',
          type: 'branding',
          label: '',
          optionId: 'logoUrl',
          options: ['none' , 'SVG' , 'IMAGE']
        }
      ]
    },
    {
      id: 'Branding',
      title: 'Company Name',
      collapsed: false,
      fields: [
        {
          id: 'companyType',
          type: 'branding',
          label: '',
          optionId: 'companyUrl',
          options: ['TEXT' , 'SVG']
        }
      ]
    },
    {
      id: 'layout',
      title: 'Minimized State',
      collapsed: false,
      fields: [
        {
          id : 'minimized_view',
          type: 'layout',
          options: ['Width (px)', 'Height (px)' , 'Position Offset (px)']
        }
      ]
    },
    {
      id: 'layout',
      title: 'Maximized State',
      collapsed: false,
      fields: [
        {
          id : 'maximized_view',
          type: 'layout',
          options: ['Width (px)', 'Height (px)' , 'Position Offset (px)']
        }
      ]
    }
  ];
}
