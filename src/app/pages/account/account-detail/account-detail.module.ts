import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskModule } from 'ngx-mask';
import { SimplebarAngularModule } from 'simplebar-angular';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { APaginatorModule } from 'src/app/shared/components/a-paginator/a-paginator.module';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { SoulboundFeatureTokensModule } from 'src/app/shared/components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { MaterialModule } from '../../../app.module';
import { CommonPipeModule } from '../../../core/pipes/common-pipe.module';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { PaginatorModule } from '../../../shared/components/paginator/paginator.module';
import { QrModule } from '../../../shared/components/qr/qr.module';
import { TableNoDataModule } from '../../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../shared/shared.module';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountDetailTableModule } from './account-detail-table/account-detail-table.module';
import { AccountDetailComponent } from './account-detail.component';
import { AccountStakeComponent } from './account-stake/account-stake.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { NftListComponent } from './nft-list/nft-list.component';
import { SoulboundTokenComponent } from './soulbound-token/soulbound-token.component';
import { TokenTableComponent } from './token-table/token-table.component';
import { AccountTransactionTableComponent } from './account-transaction-table/account-transaction-table.component';
import { UserService } from 'src/app/core/services/user.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AccountDetailComponent,
    TokenTableComponent,
    NftListComponent,
    SoulboundTokenComponent,
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
    CommonPipeModule,
    FormsModule,
    SimplebarAngularModule,
    TranslateModule,
    NgApexchartsModule,
    AccountDetailTableModule,
    TableNoDataModule,
    PaginatorModule,
    QrModule,
    NgbNavModule,
    NftCardModule,
    NgxMaskModule,
    SoulboundFeatureTokensModule,
    CommonDirectiveModule,
    APaginatorModule,
    NameTagModule,
    TooltipCustomizeModule,
    ClipboardModule,
    RouterModule
  ],
  providers: [TransactionService, AccountService, DecimalPipe, UserService],
})
export class AccountDetailModule {}
