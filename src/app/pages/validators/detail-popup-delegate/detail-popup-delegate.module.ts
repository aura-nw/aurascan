import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailPopupDelegateComponent } from './detail-popup-delegate.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { SimplebarAngularModule } from 'simplebar-angular';
import { RouterModule } from '@angular/router';
import { TableNoDataModule } from '../../../shared/table-no-data/table-no-data.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DetailPopupDelegateComponent],
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
    FormsModule
  ],
  exports: [DetailPopupDelegateComponent]
})
export class DetailPopupDelegateModule { }
