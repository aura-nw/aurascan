import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { ProposalService } from '../../../../../app/core/services/proposal.service';

@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss'],
})
export class DepositorsComponent implements OnInit {
  @Input() proposalId: number;
  voteDataList: any[] = [];
  loading = true;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {}

  async ngOnInit() {
    const res = await this.proposalService.getDepositors(this.proposalId);
    this.loading = true;
    if (res?.data?.tx_responses?.length > 0) {
      this.voteDataList = res.data.tx_responses.filter(
        (transaction) =>
          transaction?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.Deposit ||
          (transaction?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx &&
            transaction?.tx?.body?.messages[0]?.initial_deposit?.length > 0),
      );
      this.voteDataList.forEach((item) => {
        if (item.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx) {
          item.depositors = item.tx?.body?.messages[0]?.proposer;
          item.amount = balanceOf(item.tx?.body?.messages[0].initial_deposit[0].amount);
        } else {
          item.depositors = item.tx?.body?.messages[0]?.depositor;
          item.amount = balanceOf(item.tx?.body?.messages[0].amount[0].amount);
        }
      });
    }
    this.loading = false;
  }
}
