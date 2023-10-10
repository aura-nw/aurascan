import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WriteContractComponent } from './write-contract.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MaterialModule } from '../../../../../../app.module';

@NgModule({
  declarations: [WriteContractComponent],
  imports: [
    CommonModule,
    CommonPipeModule,
    TableNoDataModule,
    MaterialModule,
    MatExpansionModule,
    RouterModule,
    FormsModule,
    SharedModule,
    MatFormFieldModule,
  ],
  exports: [WriteContractComponent],
})
export class WriteContractModule {}
