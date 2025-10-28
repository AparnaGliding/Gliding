import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';
import { ApplicationListingModel, ApplicationModuleModel } from '../app-dashboard/app-dashboard.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-app-module',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './app-module.component.html',
  styleUrls: ['./app-module.component.scss']
})
export class AppModuleComponent implements OnInit, OnDestroy {
  applicationName = '';
  applicationId: number | null = null;
  modules: ApplicationModuleModel[] = [];
  isLoading = true;
  error: string | null = null;
  viewMode: 'list' | 'table' = 'list';

  // Navigation data (mirrors App Detail)
  activeTab: string = 'Modules';
  navigationTabs = [
    { name: 'Dashboard', active: false },
    { name: 'Modules', active: true },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Analytics', active: false },
    { name: 'Settings', active: false }
  ];

  private subscriptions: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appDashboardService: AppDashboardService
  ) {}

  ngOnInit(): void {
    const sub = this.route.params.subscribe(params => {
      this.applicationName = params['name'];
      // Try to read applicationId from router state first
      const nav = this.router.getCurrentNavigation();
      const stateId = nav?.extras?.state?.['applicationId'] ?? window.history.state?.applicationId;
      if (stateId) {
        this.applicationId = Number(stateId);
        this.loadModules();
      } else {
        this.resolveApplicationIdThenLoad();
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe?.());
  }

  onOpenModule(module: ApplicationModuleModel): void {
    if (!this.applicationName) { return; }
    this.router.navigate(['/apps', this.applicationName, 'modules', module.id]);
  }

  private resolveApplicationIdThenLoad(): void {
    // Fallback: fetch apps and find by name
    this.isLoading = true;
    const sub = this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => {
        const match = apps.find(a => a.name === this.applicationName);
        if (match) {
          this.applicationId = match.id;
          this.loadModules();
        } else {
          this.isLoading = false;
          this.error = 'Application not found';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Failed to load applications';
        console.error(err);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadModules(): void {
    if (!this.applicationId) { return; }
    this.isLoading = true;
    const sub = this.appDashboardService.getApplicationModules(this.applicationId).subscribe({
      next: (mods) => {
        this.modules = mods || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load modules';
        this.isLoading = false;
        console.error(err);
      }
    });
    this.subscriptions.push(sub);
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

  setView(mode: 'list' | 'table') {
    this.viewMode = mode;
  }

  isDropdownOpen: boolean = false;
  allApplications: ApplicationListingModel[] = [];
  modulesFound: number = 0;
  articlesGenerated: number = 0;
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

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
}
