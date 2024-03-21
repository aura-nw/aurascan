import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AccountBoundTokensComponent } from './account-bound-tokens/account-bound-tokens.component';
import { FungibleTokensComponent } from './fungible-tokens/fungible-tokens.component';
import { NonFungibleTokensComponent } from './non-fungible-tokens/non-fungible-tokens.component';
import { TokensRoutingModule } from './tokens-routing.module';

@NgModule({
  declarations: [FungibleTokensComponent, NonFungibleTokensComponent, AccountBoundTokensComponent],
  imports: [
    CommonModule,
    TokensRoutingModule,
    TranslateModule,
    CustomPipeModule,
    CommonDirectiveModule,
    PaginatorModule,
    SharedModule,
    TableNoDataModule,
    FormsModule,
    MaterialModule,
    CustomPaginatorModule,
    NgxMaskDirective,
    NgxMaskPipe,
    NameTagModule,
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class TokensModule {}
