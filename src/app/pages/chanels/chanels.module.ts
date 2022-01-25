import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChanelsComponent } from './chanels.component';
import { ChanelsRoutingModule } from './chaincodes-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { MaterialModule } from 'src/app/app.module';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    ChanelsComponent
  ],
  imports: [
    CommonModule,
    ChanelsRoutingModule, 
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    SharedModule
  ]
})
export class ChanelsModule { }
