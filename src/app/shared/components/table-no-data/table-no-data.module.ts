import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TableNoDataComponent } from './table-no-data.component';

@NgModule({
  declarations: [TableNoDataComponent],
  imports: [CommonModule, CommonPipeModule],
  exports: [TableNoDataComponent],
})
export class TableNoDataModule {}
