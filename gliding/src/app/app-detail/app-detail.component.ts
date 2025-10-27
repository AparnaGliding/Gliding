import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {HeaderComponent} from '../header/header.component';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {AppDashboardService} from '../app-dashboard/app-dashboard.service';
import {ApplicationModuleModel, ApplicationListingModel, EnhancedApplicationData} from '../app-dashboard/app-dashboard.model';

@Component({
  selector: 'app-app-detail',
    imports: [
        CommonModule,
        HeaderComponent,
        RouterOutlet,
        SidebarComponent
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
  
  // Dropdown data
  allApplications: ApplicationListingModel[] = [];
  isDropdownOpen: boolean = false;
  
  // Navigation data
  activeTab: string = 'Dashboard';
  navigationTabs = [
    { name: 'Dashboard', active: true },
    { name: 'AMA', active: false },
    { name: 'Knowledge Hub', active: false },
    { name: 'Analytics', active: false },
    { name: 'Map', active: false },
    { name: 'Settings', active: false }
  ];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private appDashboardService: AppDashboardService
  ) {}

  ngOnInit(): void {
    // Get the application name from route parameters
    this.route.params.subscribe(params => {
      this.applicationName = params['name'];
      console.log('Application name from route:', this.applicationName);
    });

    // Load all applications for dropdown
    this.loadAllApplications();

    // Get application data from router state if available
    const navigation = this.router.getCurrentNavigation();
    const routerState = window.history.state;
    
    console.log('=== DEBUG: Checking router state ===');
    console.log('getCurrentNavigation():', navigation);
    console.log('window.history.state:', routerState);
    
    // Try to get data from navigation first, then from history state
    let applicationData = navigation?.extras?.state?.['applicationData'] || routerState?.applicationData;
    
    if (applicationData) {
      this.applicationData = applicationData;
      this.applicationId = this.applicationData.id.toString();
      
      // Debug logging
      console.log('=== DEBUG: Application data received ===');
      console.log('Full applicationData:', this.applicationData);
      console.log('Modules array:', this.applicationData.modules);
      console.log('Modules length:', this.applicationData.modules?.length);
      console.log('First module:', this.applicationData.modules?.[0]);
      
      this.populateData();
      this.startPolling();
    } else {
      console.log('=== DEBUG: No router state data, using fallback ===');
      // Fallback: load application data based on name
      this.loadApplicationData(this.applicationName);
    }
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
        this.loadModulesData();
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
    // Navigate to AMA tab with module context
    this.onTabClick('AMA');
    // TODO: Pass module context to AMA component
  }

  onModuleViewDetails(module: ApplicationModuleModel): void {
    console.log('Viewing details for module:', module.moduleName);
    // Navigate to Knowledge Hub tab with module context
    this.onTabClick('Knowledge Hub');
    // TODO: Pass module context to Knowledge Hub component
  }

  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.navigationTabs.forEach(tab => {
      tab.active = tab.name === tabName;
    });
    console.log('Switched to tab:', tabName);
    // TODO: Implement tab content switching or routing
  }

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
      },
      error: (error) => {
        console.error('Error loading applications for dropdown:', error);
        this.allApplications = [];
      }
    });
  }

  private loadApplicationData(appName: string): void {
    // TODO: Implement logic to load specific application data
    // This could involve calling a service to get application details by name
    console.log('Loading data for application:', appName);
    
    // For now, populate with mock data when no router state data is available
    this.modulesFound = 24;
    this.articlesGenerated = 156;
    this.lastCrawled = '2 hours ago';
    this.modules = this.getMockModules();
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
        console.log('Final modules array:', this.modules);
        console.log('Sample module data:', this.modules[0]);
      } else {
        console.log('=== DEBUG: No modules in passed data, loading from API ===');
        // Fallback to loading modules from API
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
      this.appDashboardService.getApplicationModules(appId).subscribe({
        next: (modules: ApplicationModuleModel[]) => {
          this.modules = modules.map(module => ({
            ...module,
            name: module.moduleName,
            description: module.moduleSummary || 'Module description not available',
            dependencies: Math.floor(Math.random() * 3), // Mock dependencies count
            crawlDepth: 3 // Default crawl depth
          }));
          this.modulesFound = modules.length;
          console.log('Modules loaded for application:', this.modules);
        },
        error: (error) => {
          console.error('Error loading modules:', error);
          this.modules = this.getMockModules();
        }
      });

      // Load articles count
      this.appDashboardService.getArticle(appId, 1, 0, 1000).subscribe({
        next: (articles) => {
          this.articlesGenerated = articles.length;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
        }
      });
    }
  }

  private getMockModules(): any[] {
    // Mock data for demonstration - replace with actual data
    return [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
        dependencies: 0,
        crawlDepth: 3
      },
      {
        name: 'Dashboard', 
        description: 'Main dashboard interface',
        dependencies: 1,
        crawlDepth: 3
      },
      {
        name: 'Analytics',
        description: 'Data analytics and reporting',
        dependencies: 2,
        crawlDepth: 3
      }
    ];
  }
}
