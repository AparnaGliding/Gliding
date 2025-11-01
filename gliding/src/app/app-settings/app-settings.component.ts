import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from '../header/header.component';
import {ApplicationListingModel, ApplicationModuleModel} from '../app-dashboard/app-dashboard.model';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';

@Component({
  selector: 'app-app-settings',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss'
})
export class AppSettingsComponent implements OnInit {
  activeTab: string = 'General';

  authStatus = {
    connected: true,
    type: 'OAuth 2.0',
    firstAuth: 'Oct 15, 2025',
    lastUpdated: '2 hours ago',
    tokenExpiry: '30 days',
    scope: 'Read/Write'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appDashboardService: AppDashboardService
  ) {}

  ngOnInit(): void {
    // Read application name from route
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
    });

    // Load applications for header dropdown
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => this.allApplications = apps,
      error: () => this.allApplications = []
    });

    // Sync tab highlight from URL on navigation
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.syncActiveTabFromUrl();
      }
    });
    this.syncActiveTabFromUrl();
  }

  onSaveSetting(settingName: string, value: any): void {
    console.log(`Saving setting ${settingName}:`, value);
    // TODO: Implement save functionality
  }

  onResetSettings(): void {
    console.log('Resetting settings to default');
    // TODO: Implement reset functionality
  }

  setTab(tab: 'General' | 'Chat Embed' | 'API') {
    this.activeTab = tab;
  }

  applicationName = '';

  isDropdownOpen: boolean = false;
  applicationId: number | null = null;
  modules: ApplicationModuleModel[] = [];
  modulesFound: number = 0;
  articlesGenerated: number = 0;
  allApplications: ApplicationListingModel[] = [];
  selectApplication(app: ApplicationListingModel): void {
    this.isDropdownOpen = false;
    // Find the full application data from the current applications list if available
    const fullAppData = this.allApplications.find(a => a.id === app.id);

    // Navigate to the selected application's detail page
    this.router.navigate(['/apps', app.name, 'dashboard'], {
      state: {
        applicationData: {
          ...fullAppData || app,
          // Preserve any additional data if switching from current app
          modules: app.id === parseInt(String(this.applicationId)) ? this.modules : [],
          moduleCount: app.id === parseInt(String(this.applicationId)) ? this.modulesFound : 0,
          articlesCount: app.id === parseInt(String(this.applicationId)) ? this.articlesGenerated : 0,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }

  createNewApplication(): void {
    this.isDropdownOpen = false;
    // Navigate back to main dashboard to create new application
    this.router.navigate(['/apps']);
  }

  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.navigationTabs.forEach(t => t.active = (t.name === tabName));

    if (!this.applicationName) { return; }

    if (tabName === 'Dashboard') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard']);
    } else if (tabName === 'Modules') {
      this.router.navigate(['/apps', this.applicationName, 'modules']);
    }
    // Other tabs can be wired later when routes are available
  }

  private syncActiveTabFromUrl(): void {
    const url = this.router.url || '';
    let tab: string = 'Settings';
    if (url.includes('/dashboard')) { tab = 'Dashboard'; }
    else if (url.includes('/modules')) { tab = 'Modules'; }
    else if (url.includes('/settings')) { tab = 'Settings'; }
    else if (url.includes('/ama')) { tab = 'AMA'; }
    this.activeTab = tab;
    this.navigationTabs.forEach(t => t.active = (t.name === tab));
  }

  navigationTabs = [
    { name: 'Dashboard', active: false },
    { name: 'Modules', active: false },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Settings', active: true }
  ];

}
