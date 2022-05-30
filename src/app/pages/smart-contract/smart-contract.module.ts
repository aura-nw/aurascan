import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartContractRoutingModule } from './smart-contract-routing.module';
import { SmartContractDetailComponent } from './smart-contract-detail/smart-contract-detail.component';
import { OverviewComponent } from './smart-contract-detail/overview/overview.component';
import { SummaryComponent } from './smart-contract-detail/summary/summary.component';
import { InformationsComponent } from './smart-contract-detail/informations/informations.component';
import { InfoFilterComponent } from './smart-contract-detail/informations/info-filter/info-filter.component';
import { InfoTabComponent } from './smart-contract-detail/informations/info-tab/info-tab.component';
import { TransfersComponent } from './smart-contract-detail/informations/info-tab/transfers/transfers.component';
import { HoldersComponent } from './smart-contract-detail/informations/info-tab/holders/holders.component';
import { TokenChartComponent } from './smart-contract-detail/informations/info-tab/holders/token-chart/token-chart.component';
import { HolderTableComponent } from './smart-contract-detail/informations/info-tab/holders/holder-table/holder-table.component';
import { InfoComponent } from './smart-contract-detail/informations/info-tab/info/info.component';
import { ContractComponent } from './smart-contract-detail/informations/info-tab/contract/contract.component';
import { ContractReadTypeComponent } from './smart-contract-detail/informations/info-tab/contract/contract-read-type/contract-read-type.component';
import { ContractWriteTypeComponent } from './smart-contract-detail/informations/info-tab/contract/contract-write-type/contract-write-type.component';
import { AnalyticsComponent } from './smart-contract-detail/informations/info-tab/analytics/analytics.component';
import { TokenContractOverviewComponent } from './smart-contract-detail/informations/info-tab/analytics/token-contract-overview/token-contract-overview.component';
import { HistoricalPriceComponent } from './smart-contract-detail/informations/info-tab/analytics/historical-price/historical-price.component';
import { SharedModule } from '../../../app/shared/shared.module';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { MaterialModule } from '../../../app/app.module';
import { SmartContractService } from '../../../app/core/services/smart-contract.service';
import { FormsModule } from '@angular/forms';
import { TokenCw20Component } from './smart-contract-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './smart-contract-list/token-cw721/token-cw721.component';
import {MatTableModule} from "@angular/material/table";

@NgModule({
  declarations: [
    SmartContractDetailComponent,
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
    SmartContractRoutingModule,
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
  providers: [SmartContractService],
})
export class SmartContractModule { }
