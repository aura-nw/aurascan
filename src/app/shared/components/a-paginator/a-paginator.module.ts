import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APaginatorComponent } from './a-paginator.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [APaginatorComponent],
  imports: [CommonModule, NgbPaginationModule, TranslateModule],
  exports: [APaginatorComponent],
})
export class APaginatorModule {}
