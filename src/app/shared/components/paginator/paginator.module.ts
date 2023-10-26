import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { PaginatorComponent } from './paginator.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [PaginatorComponent],
  imports: [CommonModule, MaterialModule, TranslateModule],
  exports: [PaginatorComponent],
})
export class PaginatorModule {}
