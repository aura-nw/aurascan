import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APaginatorComponent } from './a-paginator.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [APaginatorComponent],
  imports: [CommonModule, NgbPaginationModule],
  exports: [APaginatorComponent],
})
export class APaginatorModule {}
