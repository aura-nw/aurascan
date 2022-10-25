import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FeeGrantComponent} from "src/app/pages/fee-grant/fee-grant.component";

const routes: Routes = [
  {
    path: '',
    component: FeeGrantComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeGrantRoutingModule { }
