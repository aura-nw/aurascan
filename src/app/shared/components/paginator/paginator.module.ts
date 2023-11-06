import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorComponent } from './paginator.component';

@NgModule({
  declarations: [PaginatorComponent],
  imports: [CommonModule, MaterialModule],
  exports: [PaginatorComponent],
})
export class PaginatorModule {}
