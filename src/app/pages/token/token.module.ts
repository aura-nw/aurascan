import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { AccountService } from 'src/app/core/services/account.service';
import { NftCardComponent } from 'src/app/shared/components/cards/nft-card/nft-card.component';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { ContractPopoverModule } from 'src/app/shared/components/contract-popover/contract-popover.module';
import { CustomVideoPlayerModule } from 'src/app/shared/components/custom-video-player/custom-video-player.module';
// import { ModelViewModule } from 'src/app/shared/components/model-view/model-view.module';
import { MaterialModule } from '../../../app/app.module';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { TokenService } from '../../core/services/token.service';
import { ReadContractModule } from '../contracts/contracts-detail/contracts-contents/contract/read-contract/read-contract.module';
import { WriteContractModule } from '../contracts/contracts-detail/contracts-contents/contract/write-contact/write-contract.module';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenContractTabComponent } from './token-detail/token-content/token-content-tab/token-contract-tab/token-contract-tab.component';
import { TokenHoldersTabComponent } from './token-detail/token-content/token-content-tab/token-holders-tab/token-holders-tab.component';
import { TokenInfoTabComponent } from './token-detail/token-content/token-content-tab/token-info-tab/token-info-tab.component';
import { TokenInventoryComponent } from './token-detail/token-content/token-content-tab/token-inventory-tab/token-inventory-tab.component';
import { TokenTransfersTabComponent } from './token-detail/token-content/token-content-tab/token-transfers-tab/token-transfers-tab.component';
import { TokenContentComponent } from './token-detail/token-content/token-content.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenOverviewComponent } from './token-detail/token-overview/token-overview.component';
import { TokenSummaryComponent } from './token-detail/token-summary/token-summary.component';
import { TokenHoldingNftComponent } from './token-holding/token-holding-nft/token-holding-nft.component';
import { TokenHoldingWalletComponent } from './token-holding/token-holding-wallet/token-holding-wallet.component';
import { TokenHoldingComponent } from './token-holding/token-holding.component';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';
import { TokenRoutingModule } from './token-routing.module';

@NgModule({
  declarations: [
    TokenDetailComponent,
    TokenCw20Component,
    TokenCw721Component,
    TokenOverviewComponent,
    TokenSummaryComponent,
    TokenContentComponent,
    TokenHoldersTabComponent,
    TokenTransfersTabComponent,
    TokenInfoTabComponent,
    TokenContractTabComponent,
    TokenHoldingComponent,
    TokenHoldingWalletComponent,
    TokenHoldingNftComponent,
    TokenInventoryComponent,
    NFTDetailComponent,
  ],
  imports: [
    CommonModule,
    TokenRoutingModule,
    SharedModule,
    NgbNavModule,
    TranslateModule,
    PaginatorModule,
    TableNoDataModule,
    MatTableModule,
    MaterialModule,
    FormsModule,
    NgbPopoverModule,
    CommonPipeModule,
    ContractPopoverModule,
    NgxMaskModule,
    WriteContractModule,
    ReadContractModule,
    CustomVideoPlayerModule,
    //ModelViewModule
    NftCardModule
  ],
  providers: [TokenService, AccountService],
})
export class TokenModule {}
