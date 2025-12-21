import {Component, Input} from '@angular/core';
import {Card} from 'primeng/card';
import {CardSection, WidgetConfiguration} from '../../appearance-cofig.model';
import {RadioButton} from 'primeng/radiobutton';
import {NgTemplateOutlet} from '@angular/common';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {ColorPicker} from 'primeng/colorpicker';
import {InputText} from 'primeng/inputtext';

@Component({
  selector: 'app-configuration-card',
  imports: [
    Card,
    RadioButton,
    ToggleSwitch,
    FormsModule,
    NgTemplateOutlet,
    ColorPicker,
    InputText
  ],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.scss'
})
export class ConfigurationCardComponent {

  @Input() widgetConfig: WidgetConfiguration;
  temp: string;
  @Input() section: CardSection;
}
