import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WriteContractComponent } from './write-contract.component';

@NgModule({
  declarations: [WriteContractComponent],
  imports: [CommonModule, CustomPipeModule, TableNoDataModule, MaterialModule, RouterModule, FormsModule, SharedModule],
  exports: [WriteContractComponent],
})
export class WriteContractModule {}
