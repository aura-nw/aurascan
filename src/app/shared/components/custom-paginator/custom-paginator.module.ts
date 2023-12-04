import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomPaginatorComponent } from './custom-paginator.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CustomPaginatorComponent],
  imports: [CommonModule, NgbPaginationModule, TranslateModule],
  exports: [CustomPaginatorComponent],
})
export class CustomPaginatorModule {}
