import { Component } from '@angular/core';
import {AppDashboardComponent} from '../app-dashboard/app-dashboard.component';
import {HeaderComponent} from '../header/header.component';
import {RouterOutlet} from '@angular/router';
import {AdminDetailComponent} from '../admin-detail/admin-detail.component';

@Component({
  selector: 'app-admin',
  imports: [
    HeaderComponent,
    RouterOutlet,
    AdminDetailComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}
