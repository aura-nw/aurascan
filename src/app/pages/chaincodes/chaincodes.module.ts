import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChaincodesComponent } from './chaincodes.component';
import { ChaincodesRoutingModule } from './chaincodes-routing.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../app/app.module';



@NgModule({
  declarations: [
    ChaincodesComponent
  ],
  imports: [
    CommonModule,
    ChaincodesRoutingModule,
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    SharedModule
  ]
})
export class ChaincodesModule { }
