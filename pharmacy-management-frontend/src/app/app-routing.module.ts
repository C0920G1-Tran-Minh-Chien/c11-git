import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'management',
    loadChildren: () => import('./management/management.module').then(module => module.ManagementModule)
  },
  {
    path: '',
    loadChildren: () => import('./client/client.module').then(module => module.ClientModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(module => module.UserModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }