import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { AudioPlayerModule } from 'src/app/shared/components/audio-player/audio-player.module';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { ModelViewModule } from 'src/app/shared/components/model-view/model-view.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { MaterialModule } from '../../../app/material.module';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { ReadContractModule } from '../contracts/contracts-detail/contracts-contents/contract/read-contract/read-contract.module';
import { WriteContractModule } from '../contracts/contracts-detail/contracts-contents/contract/write-contact/write-contract.module';
import { ContractsModule } from '../contracts/contracts.module';
import { EvmContractsModule } from '../evm-contracts/evm-contracts.module';
import { EvmNFTDetailComponent } from './evm-nft-detail/evm-nft-detail.component';
import { EvmPopupShareComponent } from './evm-nft-detail/evm-popup-share/evm-popup-share.component';
import { EvmTokenContractTabComponent } from './evm-token-content/evm-token-content-tab/evm-token-contract-tab/evm-token-contract-tab.component';
import { EvmTokenHoldersTabComponent } from './evm-token-content/evm-token-content-tab/evm-token-holders-tab/evm-token-holders-tab.component';
import { EvmTokenInfoTabComponent } from './evm-token-content/evm-token-content-tab/evm-token-info-tab/evm-token-info-tab.component';
import { EvmTokenInventoryComponent } from './evm-token-content/evm-token-content-tab/evm-token-inventory-tab/evm-token-inventory-tab.component';
import { EvmTokenTransfersTabComponent } from './evm-token-content/evm-token-content-tab/evm-token-transfers-tab/evm-token-transfers-tab.component';
import { EvmTokenContentComponent } from './evm-token-content/evm-token-content.component';
import { EvmTokenDetailComponent } from './evm-token-detail/evm-token-detail.component';
import { EvmTokenOverviewComponent } from './evm-token-overview/evm-token-overview.component';
import { EvmTokenRoutingModule } from './evm-token-routing.module';
import { EvmTokenSummaryComponent } from './evm-token-summary/evm-token-summary.component';

@NgModule({
  declarations: [
    EvmTokenDetailComponent,
    EvmTokenOverviewComponent,
    EvmTokenSummaryComponent,
    EvmTokenContentComponent,
    EvmTokenHoldersTabComponent,
    EvmTokenTransfersTabComponent,
    EvmTokenInfoTabComponent,
    EvmTokenContractTabComponent,
    EvmTokenInventoryComponent,
    EvmNFTDetailComponent,
    EvmPopupShareComponent,
  ],
  imports: [
    CommonModule,
    EvmTokenRoutingModule,
    SharedModule,
    NgbNavModule,
    TranslateModule,
    PaginatorModule,
    TableNoDataModule,
    MaterialModule,
    FormsModule,
    NgbPopoverModule,
    CustomPipeModule,
    NgxMaskDirective,
    NgxMaskPipe,
    WriteContractModule,
    ReadContractModule,
    ModelViewModule,
    NftCardModule,
    AudioPlayerModule,
    ContractsModule,
    CommonDirectiveModule,
    CustomPaginatorModule,
    NameTagModule,
    ClipboardModule,
    EvmContractsModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class EvmTokenModule {}
