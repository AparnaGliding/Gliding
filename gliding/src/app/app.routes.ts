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
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
