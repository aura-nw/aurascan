import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChaincodesComponent } from './chaincodes.component';

const routes: Routes = [
  {
    path: '',
    component: ChaincodesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ChaincodesRoutingModule { }
