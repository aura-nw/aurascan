import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { SoulboundFeatureTokensModule } from 'src/app/shared/components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { CustomPipeModule } from '../../../core/pipes/custom-pipe.module';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { MaterialModule } from '../../../material.module';
import { PaginatorModule } from '../../../shared/components/paginator/paginator.module';
import { QrModule } from '../../../shared/components/qr/qr.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../shared/shared.module';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailTableModule } from './account-detail-table/account-detail-table.module';
import { AccountDetailComponent } from './account-detail.component';
import { AccountStakeComponent } from './account-stake/account-stake.component';
import { AccountTransactionTableComponent } from './account-transaction-table/account-transaction-table.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { NftListComponent } from './nft-list/nft-list.component';
import { TokenTableComponent } from './token-table/token-table.component';
import { CardMobExecutedEvmModule } from 'src/app/shared/components/cards/card-mob-executed-evm/card-mob-executed-evm.module';

@NgModule({
  declarations: [
    AccountDetailComponent,
    TokenTableComponent,
    NftListComponent,
    AccountStakeComponent,
    AccountTransactionComponent,
    AccountTransactionTableComponent,
  ],
  imports: [
    CommonModule,
    AccountDetailRoutingModule,
    SharedModule,
    CommonModule,
    MaterialModule,
    CustomPipeModule,
    FormsModule,
    TranslateModule,
    NgApexchartsModule,
    AccountDetailTableModule,
    TableNoDataModule,
    PaginatorModule,
    QrModule,
    NgbNavModule,
    NftCardModule,
    NgxMaskPipe,
    NgxMaskDirective,
    SoulboundFeatureTokensModule,
    CommonDirectiveModule,
    CustomPaginatorModule,
    NameTagModule,
    ClipboardModule,
    RouterModule,
    CardMobExecutedEvmModule
  ],
  providers: [TransactionService, AccountService, provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class AccountDetailModule {}
