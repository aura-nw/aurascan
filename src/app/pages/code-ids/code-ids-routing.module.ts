import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeIdDetailComponent } from './code-id-detail/code-id-detail.component';
import { CodeIdListComponent } from './code-id-list/code-id-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: CodeIdListComponent,
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
