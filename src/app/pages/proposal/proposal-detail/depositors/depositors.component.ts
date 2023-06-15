import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE } from 'src/app/core/constants/proposal.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { TransactionService } from 'src/app/core/services/transaction.service';

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
  dataLength = 0;
  proposalDeposit = PROPOSAL_TABLE_MODE.DEPOSITORS;

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
  ) {
    this.proposalService.reloadList$.pipe(debounceTime(3000)).subscribe((event) => {
      if (event) {
        this.getDepositorsList();
      }
    });
  }

  ngOnInit() {
    this.getDepositorsList();
  }

  getDepositorsList(): void {
    const payload = {
      key: 'proposal_id',
      value: this.proposalId?.toString(),
      limit: 5,
      offset: 0,
    };
    this.transactionService.getListTxCondition(payload).subscribe(
      (res) => {
        let dataList: any[] = [];
        if (res?.transaction?.length > 0) {
          this.dataLength = res.transaction?.length || 0;
          dataList = res?.transaction?.filter(
            (transaction) =>
              transaction?.data?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.Deposit ||
              (transaction?.data?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx &&
                transaction?.data?.tx?.body?.messages[0]?.initial_deposit?.length > 0),
          );

          dataList.forEach((item) => {
            if (item.data?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.SubmitProposalTx) {
              item.depositors = item.data?.tx?.body?.messages[0]?.proposer;
              item.amount = balanceOf(item.data?.tx?.body?.messages[0].initial_deposit[0].amount);
            } else {
              item.depositors = item.data?.tx?.body?.messages[0]?.depositor;
              item.amount = balanceOf(item.data?.tx?.body?.messages[0].amount[0].amount);
            }
            item.txhash = item?.hash;
            item.timestamp = item?.timestamp;
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

  pageEventChange({ tabId, pageIndex, pageSize }: any) {
    console.log({ tabId, pageIndex, pageSize });
  }
}
