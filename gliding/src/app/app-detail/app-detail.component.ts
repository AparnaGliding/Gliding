import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';
import { ApplicationModuleModel, ApplicationListingModel, EnhancedApplicationData } from '../app-dashboard/app-dashboard.model';

@Component({
  selector: 'app-app-detail',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss']
})
export class AppDetailComponent implements OnInit, OnDestroy {
  applicationName: string = '';
  applicationId: string = '';
  applicationData: EnhancedApplicationData | null = null;

  // Crawl Results data
  modulesFound: number = 0;
  articlesGenerated: number = 0;
  lastCrawled: string = '';

  // Modules data
  modules: ApplicationModuleModel[] = [];
  private pollingInterval: any;
  isModulesLoading: boolean = false;
  modulesLoadingMessage: string = 'Scanning for modules...';

  // Dropdown data
  allApplications: ApplicationListingModel[] = [];
  isDropdownOpen: boolean = false;

  // Navigation data
  activeTab: string = 'Dashboard';
  navigationTabs = [
    { name: 'Dashboard', active: true },
    { name: 'Modules', active: false },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Settings', active: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appDashboardService: AppDashboardService
  ) {}

  ngOnInit(): void {
    // React to application name changes on the same component instance
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
      console.log('Application name from route:', this.applicationName);

      // Reset previous state when switching apps
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
      this.modules = [];
      this.modulesFound = 0;
      this.articlesGenerated = 0;
      this.lastCrawled = '';
      this.applicationId = '';
      this.applicationData = null;

      // Read router state every time (Angular reuses component on param change)
      const nav = this.router.getCurrentNavigation();
      const stateData = nav?.extras?.state?.['applicationData'] || window.history.state?.applicationData;

      if (stateData) {
        this.applicationData = stateData;
        this.applicationId = String(this.applicationData.id);
        this.populateData();
        this.startPolling();
      } else {
        // Fallback: resolve by name
        this.loadApplicationData(this.applicationName);
      }
    });

    // Load all applications for dropdown
    this.loadAllApplications();

    // Ensure correct tab is active on hard refresh / direct URL entry
    this.setActiveTabFromUrl(this.router.url);
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.setActiveTabFromUrl(evt.urlAfterRedirects || evt.url);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private startPolling(): void {
    // Poll every 1 minute (60000 ms) to refresh module data
    this.pollingInterval = setInterval(() => {
      if (this.applicationId) {
        console.log('Polling: Refreshing modules for application:', this.applicationId);
        // this.loadModulesData();
      }
    }, 60000);
  }

  onRerunCrawl(moduleName?: string): void {
    if (moduleName) {
      console.log('Re-running crawl for module:', moduleName);
      // TODO: Implement module-specific crawl
    } else {
      console.log('Re-running crawl for entire application');
      // TODO: Implement full application crawl
    }
  }

  onModuleAMA(module: ApplicationModuleModel): void {
    console.log('Opening AMA for module:', module.moduleName);
    this.onTabClick('AMA');

    // Navigate to the chat route: /apps/:applicationId/chat/:moduleId
    const chatRoute = ['/apps', this.applicationName, 'dashboard' , this.applicationId || '1', 'chat', module.id || '1'];
    console.log('Navigating to chat route:', chatRoute);
    this.router.navigate(chatRoute);
  }

  onModuleknowledgeBase(module: ApplicationModuleModel): void {
    console.log('Opening AMA for module:', module.moduleName);
    this.onTabClick('Knowledge Hub');

    // Navigate to the chat route: /apps/:applicationId/chat/:moduleId
    const chatRoute = ['/apps', this.applicationName, 'dashboard' , this.applicationId || '1', 'knowledge-hub', module.id || '1'];
    console.log('Navigating to chat route:', chatRoute);
    this.router.navigate(chatRoute);
  }

  onModuleViewDetails(module: ApplicationModuleModel): void {
    console.log('Viewing details for module:', module.moduleName);

    // Set active tab to 'Modules' to show the router outlet
    this.activeTab = 'Modules';
    this.navigationTabs.forEach(tab => {
      tab.active = tab.name === 'Modules';
    });

    // Navigate to module details
    this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules', module.id]);
  }

  onViewAll(): void {
    console.log('Viewing all modules for application:', this.applicationName);
    this.activeTab = 'Modules';
    this.navigationTabs.forEach(tab => {
      tab.active = tab.name === 'Modules';
    });
    this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules']);
  }


  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.navigationTabs.forEach(tab => {
      tab.active = tab.name === tabName;
    });
    console.log('Switched to tab:', tabName);

    // Handle routing based on tab
    switch (tabName) {
      case 'Dashboard':
        this.router.navigate(['/apps', this.applicationName, 'dashboard']);
        // Ensure dashboard data is present after a hard refresh from child routes
        if (!this.applicationId) {
          this.loadApplicationData(this.applicationName);
        } else if (!this.modules || this.modules.length === 0) {
          this.loadModulesData();
        }
        break;
      case 'Settings':
        this.router.navigate(['/apps', this.applicationName, 'dashboard', 'settings']);
        break;
      case 'AMA':
        this.router.navigate(['/apps', this.applicationName, 'dashboard' , this.applicationId , 'chat' , '1']);
        break;
      case 'Knowledge Hub':
        this.router.navigate(['/apps', this.applicationName , 'dashboard' , this.applicationId || '1', 'knowledge-hub' , '1']);
        break;
      default:
        break;
    }
    if (tabName === 'Modules') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules']);
    }
    // TODO: Implement tab content switching or routing for other tabs
  }

  private setActiveTabFromUrl(url: string): void {
    // Normalize URL
    const u = url.toLowerCase();
    let tab: string = 'Dashboard';
    if (u.includes('/modules')) {
      tab = 'Modules';
    } else if (u.includes('/settings')) {
      tab = 'Settings';
    } else if (u.includes('/chat/')) {
      tab = 'AMA';
    } else if (u.includes('/knowledge-hub')) {
      tab = 'Knowledge Hub';
    }
    this.activeTab = tab;
    this.navigationTabs.forEach(t => t.active = (t.name === tab));
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectApplication(app: ApplicationListingModel): void {
    this.isDropdownOpen = false;
    // Find the full application data from the current applications list if available
    const fullAppData = this.allApplications.find(a => a.id === app.id);

    // Decide target section based on current URL to preserve context
    const currentUrl = this.router.url || '';
    const url = currentUrl.toLowerCase();
    let targetCommands: any[] = ['/apps', app.name, 'dashboard'];
    if (url.includes('/modules')) {
      targetCommands = ['/apps', app.name, 'dashboard', 'modules'];
    } else if (url.includes('/settings')) {
      targetCommands = ['/apps', app.name, 'dashboard', 'settings'];
    } else if (url.includes('/chat/')) {
      // Preserve current moduleId if available; use new app id for route param
      const parts = currentUrl.split('/');
      const moduleId = parts[parts.length - 1] || '1';
      targetCommands = ['/apps', app.name, 'dashboard', app.id, 'chat', moduleId];
    } else if (url.includes('/knowledge-hub')) {
      const parts = currentUrl.split('/');
      const moduleId = parts[parts.length - 1] || '1';
      targetCommands = ['/apps', app.name, 'dashboard', app.id, 'knowledge-hub', moduleId];
    }

    // Navigate to the selected application's page preserving context
    this.router.navigate(targetCommands, {
      state: {
        applicationData: {
          ...fullAppData || app,
          // Preserve any additional data if switching from current app
          modules: app.id === parseInt(this.applicationId) ? this.modules : [],
          moduleCount: app.id === parseInt(this.applicationId) ? this.modulesFound : 0,
          articlesCount: app.id === parseInt(this.applicationId) ? this.articlesGenerated : 0,
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.app-dropdown-container');
    if (!dropdown && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  private loadAllApplications(): void {
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => {
        this.allApplications = apps;
        console.log('All applications loaded for dropdown:', this.allApplications);
        // If we don't have applicationId yet (e.g., hard refresh on child route), try to resolve it now
        if (!this.applicationId && this.applicationName) {
          const found = this.allApplications.find(a => a.name === this.applicationName);
          if (found) {
            this.applicationId = String(found.id);
            // Populate lightweight applicationData so dashboard can load
            this.applicationData = {
              ...(found as any),
              id: found.id,
              modules: [],
              moduleCount: 0,
              articlesCount: 0,
              lastUpdated: new Date().toISOString()
            } as EnhancedApplicationData;
            // Preload dashboard metrics
            this.populateData();
            this.loadModulesData();
          }
        }
      },
      error: (error) => {
        console.error('Error loading applications for dropdown:', error);
        this.allApplications = [];
      }
    });
  }

  private loadApplicationData(appName: string): void {
    // Resolve application by name then load dashboard data
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => {
        const app = apps.find(a => a.name === appName);
        if (app) {
          this.applicationId = String(app.id);
          this.applicationData = {
            ...(app as any),
            id: app.id,
            modules: [],
            moduleCount: 0,
            articlesCount: 0,
            lastUpdated: new Date().toISOString()
          } as EnhancedApplicationData;
          this.populateData();
          this.loadModulesData();
        } else {
          console.warn('Application not found for name:', appName);
        }
      },
      error: (err) => {
        console.error('Failed to resolve application by name:', err);
      }
    });
  }

  private populateData(): void {
    if (this.applicationData) {
      this.modulesFound = this.applicationData.moduleCount || 0;
      this.articlesGenerated = this.applicationData.articlesCount || 0;
      this.lastCrawled = this.calculateLastCrawled();

      console.log('=== DEBUG: populateData ===');
      console.log('moduleCount:', this.applicationData.moduleCount);
      console.log('articlesCount:', this.applicationData.articlesCount);
      console.log('modules array exists:', !!this.applicationData.modules);
      console.log('modules array length:', this.applicationData.modules?.length);

      // Use passed modules data if available, otherwise load from API
      if (this.applicationData.modules && this.applicationData.modules.length > 0) {
        console.log('=== DEBUG: Using passed modules data ===');
        this.modules = this.applicationData.modules;
        this.isModulesLoading = false;
        console.log('Final modules array:', this.modules);
        console.log('Sample module data:', this.modules[0]);
      } else {
        console.log('=== DEBUG: No modules in passed data, loading from API ===');
        // Start loading state and load from API
        this.isModulesLoading = true;
        this.loadModulesData();
      }
    }
  }

  private calculateLastCrawled(): string {
    if (this.applicationData?.lastUpdated) {
      const lastUpdate = new Date(this.applicationData.lastUpdated);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    }
    return '2 hours ago'; // Default fallback
  }

  private loadModulesData(): void {
    if (this.applicationId) {
      const appId = parseInt(this.applicationId);

      // Start progressive loading simulation
      this.startProgressiveModuleLoading(appId);

      // Load articles count
      this.appDashboardService.getArticle(appId, 0, 1, 0, 1000).subscribe({
        next: (articles) => {
          this.articlesGenerated = articles.length;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
        }
      });
    }
  }

  private startProgressiveModuleLoading(appId: number): void {
    // Initial call to get modules
    this.pollModulesData(appId);

    // Set up polling every 30 seconds for progressive loading
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.pollModulesData(appId);
    }, 30000); // 30 seconds
  }

  private pollModulesData(appId: number): void {
    console.log('Polling modules data for progressive loading...');

    this.appDashboardService.getApplicationModules(appId).subscribe({
      next: (modules: ApplicationModuleModel[]) => {
        const previousCount = this.modules.length;
        this.modules = modules;
        this.modulesFound = modules.length;

        console.log(`Modules loaded: ${modules.length} (was ${previousCount})`);

        // Update loading message based on progress
        if (modules.length === 0) {
          this.isModulesLoading = true;
          this.modulesLoadingMessage = 'Scanning for modules...';
        } else if (modules.length < 6) { // Assuming max 6 modules after 5 minutes
          this.isModulesLoading = true;
          this.modulesLoadingMessage = `Found ${modules.length} module${modules.length > 1 ? 's' : ''}, scanning for more...`;
        } else {
          this.isModulesLoading = false;
          this.modulesLoadingMessage = '';
          // Stop polling after all modules are loaded (after ~5 minutes)
          if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
          }
        }

        console.log('Updated modules:', this.modules);
      },
      error: (error) => {
        console.error('Error loading modules:', error);
        this.isModulesLoading = false;
      }
    });
  }

}
