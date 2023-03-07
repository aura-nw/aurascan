import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractsVerifyComponent } from '../contracts/contracts-verify/contracts-verify.component';
import { CodeIdDetailComponent } from './code-id-detail/code-id-detail.component';
import { CodeIdListComponent } from './code-id-list/code-id-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: CodeIdListComponent,
  },
  {
    path: 'verify/:code_id',
    component: ContractsVerifyComponent,
  },
  {
    path: 'detail/:codeId',
    component: CodeIdDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeIdsRoutingModule {}
