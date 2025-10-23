import {Component, OnDestroy, OnInit} from '@angular/core';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    RouterOutlet
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
