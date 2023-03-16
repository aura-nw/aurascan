import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { MaterialModule } from '../../../app/app.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { BlockService } from '../../../app/core/services/block.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { BlockDetailComponent } from './block-detail/block-detail.component';
import { BlocksRoutingModule } from './blocks-routing.module';
import { BlocksComponent } from './blocks.component';

@NgModule({
  declarations: [BlocksComponent, BlockDetailComponent],
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
    TableNoDataModule,
    NgbNavModule,
    PaginatorModule,
  ],
  providers: [BlockService],
})
export class BlocksModule {}
