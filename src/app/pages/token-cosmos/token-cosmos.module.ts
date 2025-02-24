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
import { MaterialModule } from '../../material.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../shared/shared.module';
import { ReadContractModule } from '../contracts/contracts-detail/contracts-contents/contract/read-contract/read-contract.module';
import { WriteContractModule } from '../contracts/contracts-detail/contracts-contents/contract/write-contact/write-contract.module';
import { ContractsModule } from '../contracts/contracts.module';
import { EvmContractsModule } from '../evm-contracts/evm-contracts.module';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { PopupShareComponent } from './nft-detail/popup-share/popup-share.component';
import { TokenContractTabComponent } from './token-content/token-content-tab/token-contract-tab/token-contract-tab.component';
import { TokenHoldersTabComponent } from './token-content/token-content-tab/token-holders-tab/token-holders-tab.component';
import { TokenInfoTabComponent } from './token-content/token-content-tab/token-info-tab/token-info-tab.component';
import { TokenInventoryComponent } from './token-content/token-content-tab/token-inventory-tab/token-inventory-tab.component';
import { TokenTransfersTabComponent } from './token-content/token-content-tab/token-transfers-tab/token-transfers-tab.component';
import { TokenContentComponent } from './token-content/token-content.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenOverviewComponent } from './token-overview/token-overview.component';
import { TokenCosmosRoutingModule } from './token-cosmos-routing.module';
import { TokenSummaryComponent } from './token-summary/token-summary.component';
import { TokenMarketComponent } from './token-detail/token-market/token-market.component';

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
    TokenMarketComponent,
    
  ],
  imports: [
    CommonModule,
    TokenCosmosRoutingModule,
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
export class TokenCosmosModule {}
