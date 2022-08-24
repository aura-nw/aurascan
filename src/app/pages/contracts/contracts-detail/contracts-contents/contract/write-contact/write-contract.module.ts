import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { WriteContractComponent } from './write-contract.component';

@NgModule({
  declarations: [WriteContractComponent],
  imports: [CommonModule, CommonPipeModule, TableNoDataModule, MatExpansionModule, RouterModule],
  exports: [WriteContractComponent],
})
export class WriteContractModule {}
