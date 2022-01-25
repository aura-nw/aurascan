import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksComponent } from './blocks.component';
import { BlocksRoutingModule } from './blocks-routing.module';
import { MaterialModule } from 'src/app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonService } from 'src/app/core/services/common.service';
import { BlockDetailComponent } from './block-detail/block-detail.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    BlocksComponent,
    BlockDetailComponent
  ],
  imports: [
    CommonModule,
    BlocksRoutingModule,
    MaterialModule,
    NgxMaskModule,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule
  ],
  providers: [CommonService]
})
export class BlocksModule { }
