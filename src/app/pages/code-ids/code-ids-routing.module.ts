import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeListComponent } from 'src/app/pages/code-ids/code-list/code-list.component';
import { CodeDetailComponent } from 'src/app/pages/code-ids/code-detail/code-detail.component';

const routes: Routes = [
  {
    path: 'list',
    component: CodeListComponent,
  },
  {
    path: 'detail/:codeId',
    component: CodeDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeIdsRoutingModule {}
