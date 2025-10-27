import {Component, OnDestroy, OnInit} from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {RouterOutlet} from '@angular/router';
import {AppDashboardComponent} from '../app-dashboard/app-dashboard.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
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
