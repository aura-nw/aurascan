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
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
  declarations: [
    ProposalComponent,
    ProposalDetailComponent,
    ProposalVoteComponent,
  ],
    imports: [
        CommonModule,
        ProposalRoutingModule,
        SharedModule,
        MaterialModule,
        TranslateModule,
        FormsModule,
        NgxMaskModule
    ],
    providers: [ProposalService]
})
export class ProposalModule { }
