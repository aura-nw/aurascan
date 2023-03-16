import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { SimplebarAngularModule } from 'simplebar-angular';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { CommonPipeModule } from '../../../../core/pipes/common-pipe.module';
import { PaginatorModule } from '../../../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../../shared/components/table-no-data/table-no-data.module';
import { AccountDetailTableComponent } from './account-detail-table.component';

@NgModule({
  declarations: [AccountDetailTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslateModule,
    CommonPipeModule,
    SimplebarAngularModule,
    RouterModule,
    TableNoDataModule,
    PaginatorModule,
    LoadingImageModule,
    NgxMaskModule,
  ],
  exports: [AccountDetailTableComponent],
})
export class AccountDetailTableModule {}
