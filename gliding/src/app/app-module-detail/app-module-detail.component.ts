import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import {ApplicationListingModel, ApplicationModuleModel, ArticleListResponseModel} from '../app-dashboard/app-dashboard.model';
import { AppDashboardService } from '../app-dashboard/app-dashboard.service';

@Component({
  selector: 'app-app-module-detail',
  imports: [CommonModule],
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

    { name: 'Settings', active: false }
  ];

  // Inner tabs for module detail
  innerActiveTab: string = 'Features';
  innerTabs = [
    { name: 'Features', active: true },
    { name: 'Articles', active: false }
  ];

  // Data
  allApplications: ApplicationListingModel[] = [];
  modules: ApplicationModuleModel[] = [];
  currentModule: ApplicationModuleModel | null = null;
  isLoading: boolean = true;
  articles: ArticleListResponseModel[] = [];
  functionalities: ApplicationListingModel[] = [];

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
      this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules']);
    } else if (tabName === 'Settings') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard', 'settings']);
    }
  }

  backToModules(): void {
    if (!this.applicationName) { return; }
    this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules']);
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

    // Navigate to the selected application's modules page (stay in Modules context)
    this.router.navigate(['/apps', app.name, 'dashboard', 'modules'], {
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
      this.router.navigate(['/apps', this.applicationName, 'dashboard', 'modules']);
    } else if (tabName === 'Settings') {
      this.router.navigate(['/apps', this.applicationName, 'dashboard', 'settings']);
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
        if (true) {
          this.applicationId = 1;
          this.loadModules(1);
          this.loadArticles(1);
        } else {
          // Fallback to mock data when app cannot be resolved
          const appId = 0;
          this.modules = this.getMockModules(appId);
          this.modulesFound = this.modules.length;
          const idNum = Number(this.moduleId);
          this.currentModule = this.modules.find(m => m.id === idNum) || this.modules[0] || null;
          this.articles = [];
          this.articlesGenerated = 0;
          this.isLoading = false;
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  private loadModules(appId: number): void {
    const crawlStatusLabels: Record<string, string> = {
      PARTIAL_CRAWL_IN_PROGRESS: 'Partial Crawl Running',
      PARTIAL_CRAWL_COMPLETED: 'Partial Crawl Completed',
      DEEP_CRAWL_IN_PROGRESS: 'Deep Crawl Running',
      DEEP_CRAWL_COMPLETED: 'Deep Crawl Completed',
      DEEP_CRAWL_SCHEDULED: 'Deep Crawl Scheduled',
      DEEP_CRAWL_NOT_TRIGGERED: 'Deep Crawl Not Triggered'
    };
    this.appDashboardService.getApplicationModules(appId).subscribe({
      next: (mods) => {
        this.modules = (mods && mods.length) ? mods : this.getMockModules(appId);
        this.modulesFound = this.modules.length;
        const idNum = Number(this.moduleId);
        this.currentModule = this.modules.find(m => m.id === idNum) || this.modules[0] || null;
        console.log(this.currentModule);
        if (this.currentModule?.crawlStatus) {
          const originalStatus = this.currentModule.crawlStatus;
          this.currentModule.crawlStatus =
            crawlStatusLabels[originalStatus]; }


        // Load functionalities for this module
        // if (this.currentModule) {
          this.loadFunctionalities(appId, this.currentModule.id);
        // }

        this.isLoading = false;
      },
      error: () => {
        this.modules = this.getMockModules(appId);
        this.modulesFound = this.modules.length;
        const idNum = Number(this.moduleId);
        this.currentModule = this.modules.find(m => m.id === idNum) || this.modules[0] || null;
        this.isLoading = false;
      }
    });
  }

  private loadFunctionalities(appId: number, moduleId: number): void {
    console.log('Loading functionalities for appId:', appId, 'moduleId:', moduleId);
    this.appDashboardService.getModuleFunctionalities(appId, moduleId).subscribe({
      next: (funcs) => {
        console.log('Functionalities loaded:', funcs);
        this.functionalities = funcs || [];
      },
      error: (err) => {
        console.error('Error loading functionalities:', err);
        this.functionalities = [];
      }
    });
  }

  private loadArticles(appId: number): void {
    // TODO: replace hardcoded userId with actual logged-in user when available
    const userId = 1;
    this.appDashboardService.getArticle(appId, userId).subscribe({
      next: (arts) => {
        this.articles = (arts && arts.length) ? arts : [];
        this.articlesGenerated = this.articles.length;
      },
      error: () => {
        this.articles = [];
        this.articlesGenerated = this.articles.length;
      }
    });
  }

  private getMockModules(appId: number): ApplicationModuleModel[] {
    const now = new Date();
    return [
      {
        id: 1,
        moduleName: 'User Login',
        moduleUrl: '/api/auth/login',
        moduleSummary: 'Standard username/password authentication',
        applicationId: appId,
        crawlStatus: 'ACTIVE',
        createdAt: now,
        modifiedAt: now,
        version: 1
      },
      {
        id: 2,
        moduleName: 'Social Login',
        moduleUrl: '/api/auth/social',
        moduleSummary: 'OAuth integration with Google, GitHub, and Microsoft',
        applicationId: appId,
        crawlStatus: 'ACTIVE',
        createdAt: now,
        modifiedAt: now,
        version: 1
      }
    ];
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
