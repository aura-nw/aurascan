import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
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
  @Input() proposalDetail: any;
  depositorsList: any[] = [];
  tableData = [];
  loading = true;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  dataLength = 0;
  proposalDeposit = PROPOSAL_TABLE_MODE.DEPOSITORS;
  errTxt: string;

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
    this.proposalService
      .getBlockSubmitTime(this.proposalDetail?.submit_time, this.proposalDetail?.deposit_end_time)
      .subscribe({
        next: (res) => {
          const payload = {
            key: 'proposal_id',
            value: this.proposalDetail?.proposal_id?.toString(),
            limit: 100, // get all
            compositeKey: 'proposal_deposit.proposal_id',
            heightGT: res.startBlock[0]?.height,
            heightLT: res.endBlock[0]?.height,
          };
          this.getDataDeposit(payload);
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.loading = false;
        },
      });
  }

  getDataDeposit(payload): void {
    this.transactionService.getProposalDepositor(payload).subscribe({
      next: (res) => {
        let dataList: any[] = [];
        if (res?.transaction?.length > 0) {
          res?.transaction.forEach((tx) => {
            tx['transaction_messages'].forEach((item) => {
              if (item.content?.initial_deposit?.length > 0) {
                tx.amount = balanceOf(item.content.initial_deposit[0].amount);
                tx.depositors = item?.content.proposer;
                dataList.push(tx);
              } else if (item.content?.amount?.length > 0) {
                tx.amount = balanceOf(item.content?.amount[0]?.amount);
                tx.depositors = item?.content.depositor;
                dataList.push(tx);
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
      error: (e) => {
        this.loading = false;
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
      },
    });
  }

  pageEventChange({ pageIndex, pageSize }: any) {
    this.pageData = { pageIndex, pageSize };
    this.tableData = this.depositorsList.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
  }
}
