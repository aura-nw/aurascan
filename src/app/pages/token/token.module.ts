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
import { NFTDetailComponent } from './cosmos-token/nft-detail/nft-detail.component';
import { PopupShareComponent } from './cosmos-token/nft-detail/popup-share/popup-share.component';
import { TokenContractTabComponent } from './cosmos-token/token-content/token-content-tab/token-contract-tab/token-contract-tab.component';
import { TokenHoldersTabComponent } from './cosmos-token/token-content/token-content-tab/token-holders-tab/token-holders-tab.component';
import { TokenInfoTabComponent } from './cosmos-token/token-content/token-content-tab/token-info-tab/token-info-tab.component';
import { TokenInventoryComponent } from './cosmos-token/token-content/token-content-tab/token-inventory-tab/token-inventory-tab.component';
import { TokenTransfersTabComponent } from './cosmos-token/token-content/token-content-tab/token-transfers-tab/token-transfers-tab.component';
import { TokenContentComponent } from './cosmos-token/token-content/token-content.component';
import { TokenDetailComponent } from './cosmos-token/token-detail/token-detail.component';
import { TokenOverviewComponent } from './cosmos-token/token-overview/token-overview.component';
import { TokenSummaryComponent } from './cosmos-token/token-summary/token-summary.component';
import { EvmTokenContractTabComponent } from './evm-token/evm-token-content/evm-token-content-tab/evm-token-contract-tab/evm-token-contract-tab.component';
import { EvmTokenHoldersTabComponent } from './evm-token/evm-token-content/evm-token-content-tab/evm-token-holders-tab/evm-token-holders-tab.component';
import { EvmTokenInfoTabComponent } from './evm-token/evm-token-content/evm-token-content-tab/evm-token-info-tab/evm-token-info-tab.component';
import { EvmTokenInventoryComponent } from './evm-token/evm-token-content/evm-token-content-tab/evm-token-inventory-tab/evm-token-inventory-tab.component';
import { EvmTokenTransfersTabComponent } from './evm-token/evm-token-content/evm-token-content-tab/evm-token-transfers-tab/evm-token-transfers-tab.component';
import { EvmTokenContentComponent } from './evm-token/evm-token-content/evm-token-content.component';
import { EvmTokenDetailComponent } from './evm-token/evm-token-detail/emv-token-detail.component';
import { EvmTokenOverviewComponent } from './evm-token/evm-token-overview/evm-token-overview.component';
import { EvmTokenSummaryComponent } from './evm-token/evm-token-summary/evm-token-summary.component';
import { TokenRoutingModule } from './token-routing.module';

@NgModule({
  declarations: [
    TokenDetailComponent,
    TokenOverviewComponent,
    TokenSummaryComponent,
    TokenContentComponent,
    TokenHoldersTabComponent,
    TokenTransfersTabComponent,
    TokenInfoTabComponent,
    TokenContractTabComponent,
    TokenInventoryComponent,
    NFTDetailComponent,
    PopupShareComponent,

    EvmTokenDetailComponent,
    EvmTokenOverviewComponent,
    EvmTokenSummaryComponent,
    EvmTokenContentComponent,
    EvmTokenHoldersTabComponent,
    EvmTokenTransfersTabComponent,
    EvmTokenInfoTabComponent,
    EvmTokenContractTabComponent,
    EvmTokenInventoryComponent,
  ],
  imports: [
    CommonModule,
    TokenRoutingModule,
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
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class TokenModule {}
