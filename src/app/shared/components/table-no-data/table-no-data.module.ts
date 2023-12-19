import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TableNoDataComponent } from './table-no-data.component';

@NgModule({
  declarations: [TableNoDataComponent],
  imports: [CommonModule, CustomPipeModule],
  exports: [TableNoDataComponent],
})
export class TableNoDataModule {}
