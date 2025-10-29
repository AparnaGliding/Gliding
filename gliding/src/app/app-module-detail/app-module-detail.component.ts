import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import {ApplicationListingModel, ApplicationModuleModel} from '../app-dashboard/app-dashboard.model';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';

@Component({
  selector: 'app-app-module-detail',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app-module-detail.component.html',
  styleUrls: ['./app-module-detail.component.scss']
})
export class AppModuleDetailComponent implements OnInit {
  applicationName = '';
  moduleId: string = '';
  applicationId: number | null = null;

  // Top navigation (shared across app pages)
  activeTab: string = 'Modules';
  navigationTabs = [
    { name: 'Dashboard', active: false },
    { name: 'Modules', active: false },
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

  // Data
  allApplications: ApplicationListingModel[] = [];
  modules: ApplicationModuleModel[] = [];
  currentModule: ApplicationModuleModel | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appDashboardService: AppDashboardService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
      this.moduleId = params['id'];
      this.loadHeaderData();
      this.resolveApplicationAndLoadModule();
    });
    // Keep top tabs in sync with URL
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.syncActiveTabFromUrl();
      }
    });
    this.syncActiveTabFromUrl();
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
  isDropdownOpen: boolean = false;
  modulesFound: number = 0;
  articlesGenerated: number = 0;

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
    } else if (tabName === 'Settings') {
      this.router.navigate(['/apps', this.applicationName, 'settings']);
    }
    // Other tabs can be wired later when routes are available
  }

  private loadHeaderData(): void {
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps) => this.allApplications = apps,
      error: () => this.allApplications = []
    });
  }

  private resolveApplicationAndLoadModule(): void {
    this.isLoading = true;
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps) => {
        const match = apps.find(a => a.name === this.applicationName);
        if (match) {
          this.applicationId = match.id;
          this.loadModules(match.id);
        } else {
          this.isLoading = false;
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  private loadModules(appId: number): void {
    this.appDashboardService.getApplicationModules(appId).subscribe({
      next: (mods) => {
        this.modules = mods || [];
        this.modulesFound = this.modules.length;
        const idNum = Number(this.moduleId);
        this.currentModule = this.modules.find(m => m.id === idNum) || null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private syncActiveTabFromUrl(): void {
    const url = this.router.url || '';
    let tab: string = 'Modules';
    if (url.includes('/dashboard')) tab = 'Dashboard';
    else if (url.includes('/modules')) tab = 'Modules';
    else if (url.includes('/settings')) tab = 'Settings';
    else if (url.includes('/ama')) tab = 'AMA';
    this.activeTab = tab;
    this.navigationTabs.forEach(t => t.active = (t.name === tab));
  }
}
