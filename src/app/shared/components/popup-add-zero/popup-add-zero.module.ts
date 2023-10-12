import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { PopupAddZeroComponent } from './popup-add-zero.component';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PopupAddZeroComponent],
  imports: [CommonModule, MatSelectModule, CommonPipeModule, FormsModule],
  exports: [PopupAddZeroComponent],
})
export class PopupAddZeroModule {}
