import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChanelsComponent } from './chanels.component';

const routes: Routes = [
  {
    path: '',
    component: ChanelsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ChanelsRoutingModule { }
