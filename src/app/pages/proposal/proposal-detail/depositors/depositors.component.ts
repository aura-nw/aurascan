import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE } from 'src/app/core/constants/proposal.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { ProposalService } from '../../../../../app/core/services/proposal.service';

@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss'],
})
export class DepositorsComponent implements OnInit, OnDestroy {
  @Input() proposalId: number;
  depositorsList: any[] = [];
  tableData = [];
  loading = true;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  dataLength = 0;
  proposalDeposit = PROPOSAL_TABLE_MODE.DEPOSITORS;

  pageData = { pageIndex: 0, pageSize: 5 };
  destroyed$ = new Subject();

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
  ) {
    this.proposalService.reloadList$.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
      if (event) {
        this.getDepositorsList();
      }
    });
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
  ngOnInit() {
    this.getDepositorsList();
  }

  getDepositorsList(): void {
    const payload = {
      key: 'proposal_id',
      value: this.proposalId?.toString(),
      limit: 100, // get all
      compositeKey: 'proposal_deposit.proposal_id'
    };

    this.transactionService.getListTxCondition(payload).subscribe({
      next: (res) => {
        let dataList: any[] = [];
        if (res?.transaction?.length > 0) {
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
          this.dataLength = dataList?.length || 0;

          const { pageIndex, pageSize } = this.pageData;
          this.tableData = this.depositorsList.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  pageEventChange({ pageIndex, pageSize }: any) {
    this.pageData = { pageIndex, pageSize };
    this.tableData = this.depositorsList.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
  }
}
