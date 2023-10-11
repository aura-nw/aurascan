import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateComponent } from './popup-delegate.component';
import { MASK_CONFIG } from 'src/app/app.config';

@NgModule({
  declarations: [PopupDelegateComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslateModule,
    CommonPipeModule,
    RouterModule,
    TableNoDataModule,
    FormsModule,
    NgxMaskPipe,
  ],
  exports: [PopupDelegateComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class PopupDelegateModule {}
