import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbCarouselModule, NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MaterialModule } from 'src/app/app.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { BlockService } from 'src/app/core/services/block.service';
import { CommonService } from 'src/app/core/services/common.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    RouterModule,
    NgbDropdownModule,
    NgbNavModule,
    MaterialModule,
    NgxMaskPipe,
    NgxMaskDirective,
    CommonPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableNoDataModule,
    NgbCarouselModule,
    TooltipCustomizeModule,
  ],
  providers: [DatePipe, BlockService, TransactionService, DecimalPipe, ProposalService, CommonService],
})
export class DashboardModule {}
