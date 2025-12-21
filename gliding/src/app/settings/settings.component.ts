import { Component } from '@angular/core';
import {Tab, TabList, Tabs} from 'primeng/tabs';
import {RouterLink, RouterOutlet} from "@angular/router";
import { CardModule } from 'primeng/card';



@Component({
  selector: 'app-settings',
  imports: [
    TabList,
    Tab,
    Tabs,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {


}
