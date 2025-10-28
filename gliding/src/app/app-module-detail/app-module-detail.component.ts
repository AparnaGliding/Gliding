import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-app-module-detail',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app-module-detail.component.html',
  styleUrls: ['./app-module-detail.component.scss']
})
export class AppModuleDetailComponent implements OnInit {
  applicationName = '';
  moduleId: string = '';

  // Top navigation (shared across app pages)
  activeTab: string = 'Modules';
  navigationTabs = [
    { name: 'Dashboard', active: false },
    { name: 'Modules', active: true },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Analytics', active: false },
    { name: 'Settings', active: false }
  ];

  // Inner tabs for module detail
  innerActiveTab: string = 'Features';
  innerTabs = [
    { name: 'Features', active: true },
    { name: 'AMA', active: false },
    { name: 'Articles', active: false }
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
      this.moduleId = params['id'];
    });
  }

  onTopTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.navigationTabs.forEach(t => t.active = (t.name === tabName));
    if (!this.applicationName) { return; }

    if (tabName === 'Dashboard') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard']);
    } else if (tabName === 'Modules') {
      this.router.navigate(['/apps', this.applicationName, 'modules']);
    } else if (tabName === 'Settings') {
      this.router.navigate(['/apps', this.applicationName, 'settings']);
    }
  }

  backToModules(): void {
    if (!this.applicationName) { return; }
    this.router.navigate(['/apps', this.applicationName, 'modules']);
  }

  onInnerTabClick(tabName: string): void {
    this.innerActiveTab = tabName;
    this.innerTabs.forEach(t => t.active = (t.name === tabName));
  }
}
