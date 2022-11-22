import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TokenSoulboundRoutingModule } from './token-soulbound-routing.module';
import { TokenSoulboundContractListComponent } from './token-soulbound-contract-list/token-soulbound-contract-list.component';
import { TokenSoulboundContractTokensComponent } from './token-soulbound-contract-tokens/token-soulbound-contract-tokens.component';
import { TokenSoulboundCreatePopupComponent } from './token-soulbound-create-popup/token-soulbound-create-popup.component';
import { TokenSoulboundAccountTokenListComponent } from './token-soulbound-account-token-list/token-soulbound-account-token-list.component';
import { TokenSoulboundAccountTokenEquipedComponent } from './token-soulbound-account-token-equiped/token-soulbound-account-token-equiped.component';
import { TokenSoulboundUnequippedComponent } from './token-soulbound-account-token-list/token-soulbound-unequipped/token-soulbound-unequipped.component';
import { TokenSoulboundEquippedComponent } from './token-soulbound-account-token-list/token-soulbound-equipped/token-soulbound-equipped.component';
import { TokenSoulboundDetailPopupComponent } from './token-soulbound-detail-popup/token-soulbound-detail-popup.component';
import {SharedModule} from "src/app/shared/shared.module";
import {FormsModule} from "@angular/forms";
import {CommonPipeModule} from "src/app/core/pipes/common-pipe.module";


@NgModule({
  declarations: [
    TokenSoulboundContractListComponent,
    TokenSoulboundContractTokensComponent,
    TokenSoulboundCreatePopupComponent,
    TokenSoulboundAccountTokenListComponent,
    TokenSoulboundAccountTokenEquipedComponent,
    TokenSoulboundUnequippedComponent,
    TokenSoulboundEquippedComponent,
    TokenSoulboundDetailPopupComponent
  ],
  imports: [
    CommonModule,
    TokenSoulboundRoutingModule,
    SharedModule,
    FormsModule,
    CommonPipeModule
  ]
})
export class TokenSoulboundModule { }
