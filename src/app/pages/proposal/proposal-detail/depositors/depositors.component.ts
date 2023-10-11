import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE } from 'src/app/core/constants/proposal.constant';
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
  destroyed$ = new Subject<void>();

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
      compositeKey: 'proposal_deposit.proposal_id',
    };

    this.transactionService.getProposalDeposit(payload).subscribe({
      next: (res) => {
        let dataList: any[] = [];
        if (res?.transaction?.length > 0) {
          dataList = res?.transaction;
          dataList.forEach((tx) => {
            tx['event_attributes'].forEach((item) => {
              if (item.composite_key === 'proposal_deposit.amount') {
                tx.amount = balanceOf(item?.value.replace(this.coinMinimalDenom, ''));
              }
              if (item.composite_key === 'transfer.sender') {
                tx.depositors = item?.value;
              }
            });
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
