import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksComponent } from './blocks.component';
import { BlocksRoutingModule } from './blocks-routing.module';
import { MaterialModule } from '../../../app/app.module';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BlockDetailComponent } from './block-detail/block-detail.component';
import { SharedModule } from '../../../app/shared/shared.module';
import { BlockService } from '../../../app/core/services/block.service';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';

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
    SharedModule,
    TableNoDataModule
  ],
  providers: [BlockService]
})
export class BlocksModule { }
