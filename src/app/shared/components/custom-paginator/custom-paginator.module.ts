import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomPaginatorComponent } from './custom-paginator.component';

@NgModule({
  declarations: [CustomPaginatorComponent],
  imports: [CommonModule, NgbPaginationModule],
  exports: [CustomPaginatorComponent],
})
export class CustomPaginatorModule {}
