import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {App, ApplicationListingModel, ApplicationModuleModel, ArticleListResponseModel, EnhancedApplicationData} from './app-dashboard.model';
import {AppDashboardService} from './app-dashboard.service';

@Component({
  selector: 'app-app-dashboard',
  imports: [CommonModule],
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.scss']
})
export class AppDashboardComponent implements OnInit, OnDestroy {
  totalApplications: number = 0;
  totalModules: number = 0;
  totalArticles: number = 0;
  applications: ApplicationListingModel[] = [];
  applicationsWithModules: (ApplicationListingModel & { modules?: ApplicationModuleModel[], moduleCount?: number, articlesCount?: number })[] = [];
  isLoading: boolean = true;
  private pollingInterval: any;

  constructor(private appDashboardService: AppDashboardService, private router: Router) {}

  ngOnInit(): void {
    this.loadApplications();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private startPolling(): void {
    // Poll every 10 seconds to refresh module summaries
    this.pollingInterval = setInterval(() => {
      console.log('Polling for updated module summaries every 10 seconds...');
      if (this.applications.length > 0) {
        this.loadModulesForApplications(this.applications);
      }
    }, 10000); // 10 seconds
  }

  private loadApplications(): void {
    this.appDashboardService.getApplications(1).subscribe({
      next: (apps: ApplicationListingModel[]) => {
        this.applications = apps;
        this.totalApplications = apps.length;
        this.loadModulesForApplications(apps);
        console.log('Total applications loaded:', this.totalApplications);
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
        this.totalApplications = 0;
      }
    });
  }

  private loadModulesForApplications(apps: ApplicationListingModel[]): void {
    this.applicationsWithModules = [];
    let completedRequests = 0;
    let totalModulesCount = 0;
    let totalArticlesCount = 0;

    if (apps.length === 0) {
      this.isLoading = false;
      return;
    }

    apps.forEach(app => {
      // Initialize app data
      const appWithData = {
        ...app,
        modules: [] as ApplicationModuleModel[],
        moduleCount: 0,
        articlesCount: 0
      };

      let appRequestsCompleted = 0;
      const totalAppRequests = 2; // modules + articles

      // Load modules
      this.appDashboardService.getApplicationModules(app.id).subscribe({
        next: (modules: ApplicationModuleModel[]) => {
          appWithData.modules = modules;
          appWithData.moduleCount = modules.length;
          totalModulesCount += modules.length;
          appRequestsCompleted++;

          if (appRequestsCompleted === totalAppRequests) {
            this.applicationsWithModules.push(appWithData);
            completedRequests++;

            if (completedRequests === apps.length) {
              this.totalModules = totalModulesCount;
              this.totalArticles = totalArticlesCount;
              this.isLoading = false;
              console.log('All applications with modules and articles loaded:', this.applicationsWithModules);
            }
          }
        },
        error: (error) => {
          console.error(`Error loading modules for application ${app.id}:`, error);
          appWithData.modules = [];
          appWithData.moduleCount = 0;
          appRequestsCompleted++;

          if (appRequestsCompleted === totalAppRequests) {
            this.applicationsWithModules.push(appWithData);
            completedRequests++;

            if (completedRequests === apps.length) {
              this.totalModules = totalModulesCount;
              this.totalArticles = totalArticlesCount;
              this.isLoading = false;
            }
          }
        }
      });

      // Load articles
      this.appDashboardService.getArticle(app.id, 1, 0, 1000).subscribe({
        next: (articles: ArticleListResponseModel[]) => {
          appWithData.articlesCount = articles.length;
          totalArticlesCount += articles.length;
          appRequestsCompleted++;

          if (appRequestsCompleted === totalAppRequests) {
            this.applicationsWithModules.push(appWithData);
            completedRequests++;

            if (completedRequests === apps.length) {
              this.totalModules = totalModulesCount;
              this.isLoading = false;
              console.log('All applications with modules and articles loaded:', this.applicationsWithModules);
            }
          }
        },
        error: (error) => {
          console.error(`Error loading articles for application ${app.id}:`, error);
          appWithData.articlesCount = 0;
          appRequestsCompleted++;

          if (appRequestsCompleted === totalAppRequests) {
            this.applicationsWithModules.push(appWithData);
            completedRequests++;

            if (completedRequests === apps.length) {
              this.totalModules = totalModulesCount;
              this.totalArticles = totalArticlesCount;
              this.isLoading = false;
            }
          }
        }
      });
    });
  }

  openApplication(app: ApplicationListingModel & { modules?: ApplicationModuleModel[], moduleCount?: number, articlesCount?: number }): void {
    const fullAppData = this.applicationsWithModules.find(a => a.id === app.id);
    const appToUse = fullAppData || app;

    const enhancedAppData: EnhancedApplicationData = {
      ...appToUse,
      modules: appToUse.modules || [],
      moduleCount: appToUse.moduleCount || 0,
      articlesCount: appToUse.articlesCount || 0,
      // Add additional computed data
      totalModules: this.totalModules,
      totalArticles: this.totalArticles,
      lastUpdated: new Date().toISOString()
    };
    // Navigate to app-detail component with comprehensive data
    this.router.navigate(['/apps', app.name, 'dashboard'], {
      state: {
        applicationData: enhancedAppData
      }
    });
  }

  getAppDescription(app: ApplicationListingModel & { modules?: ApplicationModuleModel[] }): string {
    if (app.domain) {
      return app.domain;
    }
    return 'Application documentation';
  }

  getModuleSummaries(app: ApplicationListingModel & { modules?: ApplicationModuleModel[] }): string {
    if (app.modules && app.modules.length > 0) {
      const summaries = app.modules
        .filter(module => module.moduleSummary && module.moduleSummary.trim() !== '')
        .map(module => module.moduleSummary)
        .slice(0, 3); // Show only first 3 summaries to avoid overcrowding
      if (summaries.length > 0) {
        return summaries.join(' • ');
      }
    }
    return 'Module summaries will be available once processing is complete.';
  }

  createNewApplication(): void {
    this.router.navigate(['/apps/create']);
  }
}
