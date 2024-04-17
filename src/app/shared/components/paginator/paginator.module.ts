import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorComponent } from './paginator.component';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';

@NgModule({
  declarations: [PaginatorComponent],
  imports: [CommonModule, MaterialModule, CustomPipeModule],
  exports: [PaginatorComponent],
})
export class PaginatorModule {}
