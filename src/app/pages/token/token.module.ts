import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from "@angular/material/table";
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../app/app.module';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { TokenService } from '../../core/services/token.service';
import { TokenContractReadComponent } from './token-detail/token-content/token-content-tab/token-contract-tab/token-contract-read/token-contract-read.component';
import { TokenContractTabComponent } from './token-detail/token-content/token-content-tab/token-contract-tab/token-contract-tab.component';
import { TokenContractWriteComponent } from './token-detail/token-content/token-content-tab/token-contract-tab/token-contract-write/token-contract-write.component';
import { TokenHoldersTabComponent } from './token-detail/token-content/token-content-tab/token-holders-tab/token-holders-tab.component';
import { TokenInfoTabComponent } from './token-detail/token-content/token-content-tab/token-info-tab/token-info-tab.component';
import { TokenTransfersTabComponent } from './token-detail/token-content/token-content-tab/token-transfers-tab/token-transfers-tab.component';
import { TokenContentComponent } from './token-detail/token-content/token-content.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenOverviewComponent } from './token-detail/token-overview/token-overview.component';
import { TokenSummaryComponent } from './token-detail/token-summary/token-summary.component';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';
import { TokenRoutingModule } from './token-routing.module';
import { TokenHoldingComponent } from './token-holding/token-holding.component';
import { TokenHodingWalletComponent } from './token-holding/token-hoding-wallet/token-hoding-wallet.component';
import { TokenHodingNftComponent } from './token-holding/token-hoding-nft/token-hoding-nft.component';

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
    TokenContractReadComponent,
    TokenContractWriteComponent,
    TokenHoldingComponent,
    TokenHodingWalletComponent,
    TokenHodingNftComponent
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
    NgbPopoverModule
  ],
  providers: [TokenService],
})
export class TokenModule { }
