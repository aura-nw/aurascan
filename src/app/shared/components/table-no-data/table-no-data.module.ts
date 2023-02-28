import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableNoDataComponent } from './table-no-data.component';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';

@NgModule({
  declarations: [TableNoDataComponent],
  imports: [CommonModule, CommonPipeModule],
  exports: [TableNoDataComponent],
})
export class TableNoDataModule {}
