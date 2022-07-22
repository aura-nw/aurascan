import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsComponent } from './validators.component';

const routes: Routes = [
  {
    path: '',
    component: ValidatorsComponent
  },
  {
    path: ':id/:rank',
    component: ValidatorsDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ValidatorsRoutingModule { }
