import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE } from 'src/app/core/constants/proposal.constant';
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
  depositorsList: any[] = [];
  loading = true;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  nextKey = '';
  dataLength = 0;
  isNextPage = false;
  proposalDeposit = PROPOSAL_TABLE_MODE.DEPOSITORS;

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {
    this.proposalService.reloadList$.pipe(debounceTime(3000)).subscribe((event) => {
      if (event) {
        this.getDepositorsList();
      }
    });
  }

  ngOnInit() {
    this.getDepositorsList(true);
  }

  getDepositorsList(isInit = false): void {
    const payload = {
      proposalId: this.proposalId,
      pageLimit: 100,
    };
    this.proposalService.getDepositors(payload).subscribe(
      (res) => {
        let dataList: any[] = [];
        if (res?.data?.transactions?.length > 0) {
          this.dataLength = res.data.count || 0;
          dataList = res?.data?.transactions?.filter(
            (transaction) =>
              transaction?.tx_response?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.Deposit ||
              (transaction?.tx_response?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx &&
                transaction?.tx_response?.tx?.body?.messages[0]?.initial_deposit?.length > 0),
          );

          dataList.forEach((item) => {
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
          this.depositorsList = dataList;
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  loadMore($event): void {
    this.getDepositorsList();
  }
}
