import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetworkComponent } from './network.component';

const routes: Routes = [
  {
    path: '',
    component: NetworkComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class NetworkRoutingModule { }
