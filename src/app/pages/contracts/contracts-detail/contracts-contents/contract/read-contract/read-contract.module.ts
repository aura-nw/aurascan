import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { MaterialModule } from '../../../../../../material.module';
import { ReadContractComponent } from './read-contract.component';

@NgModule({
  declarations: [ReadContractComponent],
  imports: [
    CommonModule,
    CustomPipeModule,
    TableNoDataModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
  ],
  exports: [ReadContractComponent],
})
export class ReadContractModule {}
