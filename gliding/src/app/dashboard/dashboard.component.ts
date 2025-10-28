import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AppDashboardComponent} from '../app-dashboard/app-dashboard.component';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    HeaderComponent,
    RouterOutlet,
    AppDashboardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  implements OnInit, OnDestroy {
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

}
