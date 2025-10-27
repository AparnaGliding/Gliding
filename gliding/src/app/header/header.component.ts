import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router) {
  }
  ngOnInit() {
  }


  openChat(appId: number, moduleId: number) {
    this.router.navigate(['/apps', appId, 'chat', moduleId]);
  }
  openKnowledge(appId: number, moduleId: number) {
    this.router.navigate(['/apps', appId, 'knowledge-hub']);
  }

}
