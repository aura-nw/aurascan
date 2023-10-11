import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { APaginatorModule } from 'src/app/shared/components/a-paginator/a-paginator.module';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { CommonPipeModule } from '../../../app/core/pipes/common-pipe.module';
import { MappingErrorService } from '../../core/services/mapping-error.service';
import { ProposalService } from '../../core/services/proposal.service';
import { MaterialModule } from '../../material.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../shared/shared.module';
import { DepositorsComponent } from './proposal-detail/depositors/depositors.component';
import { ProposalDetailComponent } from './proposal-detail/proposal-detail.component';
import { CurrentStatusComponent } from './proposal-detail/summary-info/current-status/current-status.component';
import { CurrentTurnoutComponent } from './proposal-detail/summary-info/current-turnout/current-turnout.component';
import { SummaryInfoComponent } from './proposal-detail/summary-info/summary-info.component';
import { ValidatorsVotesComponent } from './proposal-detail/validators-votes/validators-votes.component';
import { VotesComponent } from './proposal-detail/votes/votes.component';
import { ProposalRoutingModule } from './proposal-routing.module';
import { ProposalTableComponent } from './proposal-table/proposal-table.component';
import { ProposalVoteComponent } from './proposal-vote/proposal-vote.component';
import { ProposalComponent } from './proposal.component';

@NgModule({
  declarations: [
    ProposalComponent,
    ProposalDetailComponent,
    ProposalVoteComponent,
    SummaryInfoComponent,
    VotesComponent,
    ValidatorsVotesComponent,
    DepositorsComponent,
    ProposalTableComponent,
    CurrentTurnoutComponent,
    CurrentStatusComponent,
  ],
  imports: [
    CommonModule,
    ProposalRoutingModule,
    SharedModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
    CommonPipeModule,
    NgbProgressbarModule,
    NgbNavModule,
    NgxMaskDirective,
    NgxMaskPipe,
    TableNoDataModule,
    PaginatorModule,
    LoadingImageModule,
    APaginatorModule,
    NameTagModule,
    TooltipCustomizeModule,
  ],
  providers: [ProposalService, MappingErrorService, DecimalPipe, ValidatorService],
})
export class ProposalModule {}
