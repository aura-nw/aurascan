import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProposalRoutingModule } from './proposal-routing.module';
import { ProposalComponent } from './proposal.component';
import { ProposalDetailComponent } from './proposal-detail/proposal-detail.component';
import {SharedModule} from "../../shared/shared.module";
import {MaterialModule} from "../../app.module";
import {TranslateModule} from "@ngx-translate/core";
import {ProposalService} from "../../core/services/proposal.service";
import { ProposalVoteComponent } from './proposal-vote/proposal-vote.component';
import { FormsModule } from '@angular/forms';
import { SummaryInfoComponent } from './proposal-detail/summary-info/summary-info.component';
import { VotesComponent } from './proposal-detail/votes/votes.component';
import { ValidatorsVotesComponent } from './proposal-detail/validators-votes/validators-votes.component';
import { DepositorsComponent } from './proposal-detail/depositors/depositors.component';
import { ProposalTableComponent } from './proposal-table/proposal-table.component';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { NgbDropdownModule, NgbAlertModule, NgbCarouselModule, NgbProgressbarModule, NgbNavModule, NgbCollapseModule, NgbAccordionModule, NgbPopoverModule, NgbTooltipModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';


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
  ],
    imports: [
        CommonModule,
        ProposalRoutingModule,
        SharedModule,
        MaterialModule,
        TranslateModule,
        FormsModule,
        CommonPipeModule    
        ,NgbDropdownModule,
        NgbAlertModule,
        NgbCarouselModule,
        NgbProgressbarModule,
        NgbNavModule,
        NgbCollapseModule,
        NgbAccordionModule,
        NgbPopoverModule,
        NgbTooltipModule,
        NgbPaginationModule,
    ],
    providers: [ProposalService]
})
export class ProposalModule { }
