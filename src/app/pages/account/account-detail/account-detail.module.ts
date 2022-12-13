import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxMaskModule } from 'ngx-mask';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { CustomVideoPlayerModule } from 'src/app/shared/components/custom-video-player/custom-video-player.module';
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
import { NftListComponent } from './nft-list/nft-list.component';
import { TokenTableComponent } from './token-table/token-table.component';
import { SoulboundTokenComponent } from './soulbound-token/soulbound-token.component';

@NgModule({
  declarations: [AccountDetailComponent, TokenTableComponent, NftListComponent, SoulboundTokenComponent],
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
    CustomVideoPlayerModule,
    NftCardModule,
    NgxMaskModule,
  ],
  providers: [TransactionService, AccountService, DecimalPipe],
})
export class AccountDetailModule {}
