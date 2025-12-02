import {RouterModule, Routes} from '@angular/router';

import {DomainGuard} from './auth/domain.guard';
import {NgModule} from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat-embed/chat-embed.component').then(m => m.ChatEmbedComponent),
  },
  {
    path: 'apps',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children : [
      {
        path: ':id/knowledge-hub',
        loadComponent: () => import('./knowledge-hub/knowledge-hub.component').then(m => m.KnowledgeHubComponent)
      }
    ]
  },
  {
    path: 'apps/create',
    loadComponent: () => import('./create-application/create-application.component').then(m => m.CreateApplicationComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent)
  },
  // {
  //   path: 'apps/:applicationId/chat/:moduleId',
  //   loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
  // },
  // {
  //   path: 'apps/:id/knowledge-hub',
  //   loadComponent: () => import('./knowledge-hub/knowledge-hub.component').then(m => m.KnowledgeHubComponent)
  // },
  {
    path: 'apps/:name/dashboard',
    loadComponent: () => import('./app-detail/app-detail.component').then(m => m.AppDetailComponent),
    children: [
      {
        path: ':id/chat/:moduleId',
        loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: ':id/knowledge-hub/:moduleId',
        loadComponent: () =>  import('./knowledge-hub/knowledge-hub.component').then(m => m.KnowledgeHubComponent)
      },
      {
        path: 'modules',
        loadComponent: () => import('./app-module/app-module.component').then(m => m.AppModuleComponent)
      },
      {
        path: 'modules/:id',
        loadComponent: () => import('./app-module-detail/app-module-detail.component').then(m => m.AppModuleDetailComponent)
      },
      {
        path: 'modules/:id/articles/:articleId',
        loadComponent: () => import('./article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./app-settings/app-settings.component').then(m => m.AppSettingsComponent)
      }
    ]
  },
  // {
  //   path: 'apps/:name/dashboard/:id/chat/:moduleId',
  //   loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
  // },
  // {
  //   path: 'apps/:name/dashboard/:id/knowledge-hub/:moduleId',
  //   loadComponent: () =>  import('./knowledge-hub/knowledge-hub.component').then(m => m.KnowledgeHubComponent)
  // },
  // {
  //   path: 'apps/:name/settings',
  //   loadComponent: () => import('./app-settings/app-settings.component').then(m => m.AppSettingsComponent)
  // }
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
