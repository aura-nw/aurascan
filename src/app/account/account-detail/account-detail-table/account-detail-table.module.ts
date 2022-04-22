import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDetailTableComponent } from './account-detail-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { SimplebarAngularModule } from 'simplebar-angular';
import { RouterModule } from '@angular/router';
import { TableNoDataModule } from '../../../../app/shared/table-no-data/table-no-data.module';
import { PaginatorModule } from '../../../shared/components/paginator/paginator.module';

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
    PaginatorModule
  ],
  exports: [AccountDetailTableComponent]
})
export class AccountDetailTableModule { }
