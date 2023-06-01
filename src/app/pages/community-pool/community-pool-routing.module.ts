import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommunityPoolComponent } from './community-pool.component';

const routes: Routes = [
  {
    path: '',
    component: CommunityPoolComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunityPoolRoutingModule {}
