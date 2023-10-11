import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { PopupAddZeroComponent } from './popup-add-zero.component';

@NgModule({
  declarations: [PopupAddZeroComponent],
  imports: [CommonModule, MaterialModule, CommonPipeModule, FormsModule],
  exports: [PopupAddZeroComponent],
})
export class PopupAddZeroModule {}
