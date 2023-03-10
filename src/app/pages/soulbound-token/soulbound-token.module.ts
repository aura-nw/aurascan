import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/app.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { AudioPlayerModule } from 'src/app/shared/components/audio-player/audio-player.module';
import { NftCardModule } from 'src/app/shared/components/cards/nft-card/nft-card.module';
import { ModelViewModule } from 'src/app/shared/components/model-view/model-view.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { QrModule } from 'src/app/shared/components/qr/qr.module';
import { SoulboundFeatureTokensModule } from 'src/app/shared/components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SoulboundAccountTokenListComponent } from './soulbound-account-token-list/soulbound-account-token-list.component';
import { SoulboundTokenEquippedComponent } from './soulbound-account-token-list/soulbound-token-equipped/soulbound-token-equipped.component';
import { SoulboundTokenUnequippedComponent } from './soulbound-account-token-list/soulbound-token-unequipped/soulbound-token-unequipped.component';
import { SoulboundContractListComponent } from './soulbound-contract-list/soulbound-contract-list.component';
import { SoulboundTokenContractComponent } from './soulbound-token-contract/soulbound-token-contract.component';
import { SoulboundTokenCreatePopupComponent } from './soulbound-token-create-popup/soulbound-token-create-popup.component';
import { SoulboundTokenDetailPopupComponent } from './soulbound-token-detail-popup/soulbound-token-detail-popup.component';
import { SoulboundTokenRoutingModule } from './soulbound-token-routing.module';

@NgModule({
  declarations: [
    SoulboundContractListComponent,
    SoulboundTokenContractComponent,
    SoulboundTokenCreatePopupComponent,
    SoulboundAccountTokenListComponent,
    SoulboundTokenUnequippedComponent,
    SoulboundTokenEquippedComponent,
    SoulboundTokenCreatePopupComponent,
    SoulboundTokenDetailPopupComponent,
  ],
  imports: [
    CommonModule,
    SoulboundTokenRoutingModule,
    SharedModule,
    FormsModule,
    CommonPipeModule,
    MatTableModule,
    PaginatorModule,
    TranslateModule,
    TableNoDataModule,
    ReactiveFormsModule,
    QrModule,
    MatTooltipModule,
    NgbNavModule,
    MaterialModule,
    NftCardModule,
    SoulboundFeatureTokensModule,
    ModelViewModule,
    AudioPlayerModule,
  ],
  providers: [FormBuilder, SoulboundService],
})
export class SoulboundTokenModule {}
