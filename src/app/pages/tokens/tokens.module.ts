import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TokensRoutingModule} from './tokens-routing.module';
import {TokenCw20Component} from "./token-cw20/token-cw20.component";
import {TokenCw721Component} from "./token-cw721/token-cw721.component";
import {TokenCw4973Component} from "./token-cw4973/token-cw4973.component";
import {TranslateModule} from "@ngx-translate/core";
import {CustomPipeModule} from "src/app/core/pipes/custom-pipe.module";
import {CommonDirectiveModule} from "src/app/core/directives/common-directive.module";
import {PaginatorModule} from "src/app/shared/components/paginator/paginator.module";
import {SharedModule} from "src/app/shared/shared.module";
import {TableNoDataModule} from "src/app/shared/components/table-no-data/table-no-data.module";
import {CustomPaginatorModule} from "src/app/shared/components/custom-paginator/custom-paginator.module";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "src/app/material.module";
import {NameTagModule} from "src/app/shared/components/name-tag/name-tag.module";
import {NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask} from "ngx-mask";
import {MASK_CONFIG} from "src/app/app.config";


@NgModule({
  declarations: [
    TokenCw20Component,
    TokenCw721Component,
    TokenCw4973Component
  ],
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
    NameTagModule
  ],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class TokensModule {
}
