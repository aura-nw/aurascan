import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WriteContractComponent } from './write-contract.component';

@NgModule({
  declarations: [WriteContractComponent],
  imports: [
    CommonModule,
    CommonPipeModule,
    TableNoDataModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    SharedModule,
    TranslateModule,
  ],
  exports: [WriteContractComponent],
})
export class WriteContractModule {}
