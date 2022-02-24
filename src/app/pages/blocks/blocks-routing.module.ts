import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BlockDetailComponent } from './block-detail/block-detail.component';

import { BlocksComponent } from './blocks.component';

const routes: Routes = [
  {
    path: '',
    component: BlocksComponent
  },
  {
    path: ':id',
    component: BlockDetailComponent
  },
  {
    path: 'id/:blockId',
    component: BlockDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class BlocksRoutingModule { }
