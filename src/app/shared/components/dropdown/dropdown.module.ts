import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';

@NgModule({
  declarations: [DropdownComponent],
  imports: [CommonModule, TranslateModule, CommonPipeModule],
  exports: [DropdownComponent],
})
export class DropdownModule {}
