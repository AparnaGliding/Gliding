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
    path: 'apps',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children : [
      {
        path: ':id/chat/:moduleId',
        loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: ':id/knowledge-hub',
        loadComponent: () => import('./knowledge-hub/knowledge-hub.component').then(m => m.KnowledgeHubComponent)
      }
    ]
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
    path: 'apps/:name/dashboard',
    loadComponent: () => import('./app-detail/app-detail.component').then(m => m.AppDetailComponent)
  },
  {
    path: 'apps/:name/settings',
    loadComponent: () => import('./app-settings/app-settings.component').then(m => m.AppSettingsComponent)
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
