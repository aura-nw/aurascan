import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsComponent } from './validators.component';

const routes: Routes = [
  {
    path: '',
    component: ValidatorsComponent,
  },
  {
    path: ':id',
    component: ValidatorsDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ValidatorsRoutingModule {}
