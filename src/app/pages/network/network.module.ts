import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NetworkComponent } from './network.component';
import { NetworkRoutingModule } from './network-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { MaterialModule } from '../../../app/app.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';

@NgModule({
  declarations: [
    NetworkComponent
  ],
  imports: [
    CommonModule,
    NetworkRoutingModule,
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    SharedModule
  ],
  providers: [
    DecimalPipe
  ]
})
export class NetworkModule { }
