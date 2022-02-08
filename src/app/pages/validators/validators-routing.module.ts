import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';

import { validatorsComponent } from './validators.component';

const routes: Routes = [
  {
    path: '',
    component: validatorsComponent
  },
  {
    path: ':id',
    component: ValidatorsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ValidatorsRoutingModule { }
