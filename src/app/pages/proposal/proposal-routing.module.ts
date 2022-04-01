import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProposalComponent} from "./proposal.component";
import {ProposalDetailComponent} from "./proposal-detail/proposal-detail.component";

const routes: Routes = [
  {
    path: '',
    component: ProposalComponent
  },
  {
    path: ':proposalId',
    component: ProposalDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalRoutingModule { }
