import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IBCComponent } from './ibc.component';
import { ChannelDetailComponent } from './channel-detail/channel-detail.component';

const routes: Routes = [
  {
    path: '',
    component: IBCComponent,
  },
  {
    path: ':channel_id/:counterparty_channel_id',
    component: ChannelDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IBCRoutingModule {}
