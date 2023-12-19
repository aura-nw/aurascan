import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';

@NgModule({
  declarations: [DropdownComponent],
  imports: [CommonModule, TranslateModule, CustomPipeModule],
  exports: [DropdownComponent],
})
export class DropdownModule {}
