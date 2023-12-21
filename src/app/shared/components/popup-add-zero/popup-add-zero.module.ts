import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { PopupAddZeroComponent } from './popup-add-zero.component';

@NgModule({
  declarations: [PopupAddZeroComponent],
  imports: [CommonModule, MaterialModule, CustomPipeModule, FormsModule],
  exports: [PopupAddZeroComponent],
})
export class PopupAddZeroModule {}
