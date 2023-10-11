import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { MaterialModule } from '../../../../../../material.module';
import { ReadContractComponent } from './read-contract.component';

@NgModule({
  declarations: [ReadContractComponent],
  imports: [CommonModule, CommonPipeModule, TableNoDataModule, RouterModule, FormsModule, MaterialModule],
  exports: [ReadContractComponent],
})
export class ReadContractModule {}
