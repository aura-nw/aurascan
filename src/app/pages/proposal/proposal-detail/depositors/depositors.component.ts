import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  nextKey = '';

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit() {
    this.loading = true;
    const payload = {
      proposalId: this.proposalId,
      pageLimit: 100,
      nextKey: this.nextKey,
    };
    this.proposalService.getDepositors(payload).subscribe((res) => {
      if (res?.data?.transactions?.length > 0) {
        this.voteDataList = res?.data?.transactions?.filter(
          (transaction) =>
            transaction?.tx_response?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.Deposit ||
            (transaction?.tx_response?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx &&
              transaction?.tx_response?.tx?.body?.messages[0]?.initial_deposit?.length > 0),
        );
        this.voteDataList.forEach((item) => {
          if (item.tx_response?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx) {
            item.depositors = item.tx_response?.tx?.body?.messages[0]?.proposer;
            item.amount = balanceOf(item.tx_response?.tx?.body?.messages[0].initial_deposit[0].amount);
          } else {
            item.depositors = item.tx_response?.tx?.body?.messages[0]?.depositor;
            item.amount = balanceOf(item.tx_response?.tx?.body?.messages[0].amount[0].amount);
          }
          item.txhash = item?.tx_response?.txhash;
          item.timestamp = item?.tx_response?.timestamp;
        });
        this.nextKey = res.data?.nextKey;
      }
    });
    this.loading = false;
  }
}
