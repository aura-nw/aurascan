import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from "./profile.component";
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  },
  {
    path: 'profile-settings',
    component: ProfileSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
