import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EvmContractsRoutingModule } from './evm-contracts-routing.module';
import { EvmContractsListComponent } from './evm-contracts-list/evm-contracts-list.component';
import { EvmContractsDetailComponent } from './evm-contracts-detail/evm-contracts-detail.component';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [EvmContractsListComponent, EvmContractsDetailComponent],
  imports: [
    CommonModule,
    EvmContractsRoutingModule,
    CustomPaginatorModule,
    TableNoDataModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule,
    CustomPipeModule,
    NameTagModule,
    CommonDirectiveModule,
    TranslateModule,
  ],
})
export class EvmContractsModule {}
