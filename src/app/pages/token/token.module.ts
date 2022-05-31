import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenRoutingModule } from './token-routing.module';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { OverviewComponent } from './token-detail/overview/overview.component';
import { SummaryComponent } from './token-detail/summary/summary.component';
import { InformationsComponent } from './token-detail/informations/informations.component';
import { InfoFilterComponent } from './token-detail/informations/info-filter/info-filter.component';
import { InfoTabComponent } from './token-detail/informations/info-tab/info-tab.component';
import { TransfersComponent } from './token-detail/informations/info-tab/transfers/transfers.component';
import { HoldersComponent } from './token-detail/informations/info-tab/holders/holders.component';
import { TokenChartComponent } from './token-detail/informations/info-tab/holders/token-chart/token-chart.component';
import { HolderTableComponent } from './token-detail/informations/info-tab/holders/holder-table/holder-table.component';
import { InfoComponent } from './token-detail/informations/info-tab/info/info.component';
import { ContractComponent } from './token-detail/informations/info-tab/contract/contract.component';
import { ContractReadTypeComponent } from './token-detail/informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from './token-detail/informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { AnalyticsComponent } from './token-detail/informations/info-tab/analytics/analytics.component';
import { TokenContractOverviewComponent } from './token-detail/informations/info-tab/analytics/token-contract-overview/token-contract-overview.component';
import { HistoricalPriceComponent } from './token-detail/informations/info-tab/analytics/historical-price/historical-price.component';
import { SharedModule } from '../../../app/shared/shared.module';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { MaterialModule } from '../../../app/app.module';
import { TokenService } from '../../core/services/token.service';
import { FormsModule } from '@angular/forms';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';
import {MatTableModule} from "@angular/material/table";

@NgModule({
  declarations: [
    TokenDetailComponent,
    OverviewComponent,
    SummaryComponent,
    InformationsComponent,
    InfoFilterComponent,
    InfoTabComponent,
    TransfersComponent,
    HoldersComponent,
    TokenChartComponent,
    HolderTableComponent,
    InfoComponent,
    ContractComponent,
    ContractReadTypeComponent,
    ContractWriteTypeComponent,
    AnalyticsComponent,
    TokenContractOverviewComponent,
    HistoricalPriceComponent,
    TokenCw20Component,
    TokenCw721Component
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
