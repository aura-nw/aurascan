import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WriteContractComponent } from './write-contract.component';

@NgModule({
  declarations: [WriteContractComponent],
  imports: [
    CommonModule,
    CommonPipeModule,
    TableNoDataModule,
    MatExpansionModule,
    RouterModule,
    FormsModule,
    SharedModule,
  ],
  exports: [WriteContractComponent],
})
export class WriteContractModule {}
