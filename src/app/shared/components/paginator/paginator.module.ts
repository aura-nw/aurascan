import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './paginator.component';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

@NgModule({
  declarations: [PaginatorComponent],
  imports: [CommonModule, MatPaginatorModule],
  exports: [PaginatorComponent],
})
export class PaginatorModule {}
