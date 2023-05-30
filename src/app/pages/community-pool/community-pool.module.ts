import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { AccountService } from 'src/app/core/services/account.service';
import { AudioPlayerModule } from 'src/app/shared/components/audio-player/audio-player.module';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { ContractPopoverModule } from 'src/app/shared/components/contract-popover/contract-popover.module';
import { ModelViewModule } from 'src/app/shared/components/model-view/model-view.module';
import { MaterialModule } from '../../../app/app.module';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { TokenService } from '../../core/services/token.service';
import { ReadContractModule } from '../contracts/contracts-detail/contracts-contents/contract/read-contract/read-contract.module';
import { WriteContractModule } from '../contracts/contracts-detail/contracts-contents/contract/write-contact/write-contract.module';
import { ContractsModule } from '../contracts/contracts.module';
import { CommunityPoolRoutingModule } from './community-pool-routing.module';
import { CommunityPoolComponent } from './community-pool.component';

@NgModule({
  declarations: [CommunityPoolComponent],
  imports: [
    CommunityPoolRoutingModule,
    CommonModule,
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
    ModelViewModule,
    NftCardModule,
    AudioPlayerModule,
    ContractsModule,
    CommonDirectiveModule,
  ],
  // providers: [TokenService, AccountService],
})
export class CommunityPoolModule {}
