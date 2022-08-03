import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { parseDataTransaction } from 'src/app/core/utils/common/info-common';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { DATEFORMAT } from '../../../../core/constants/common.constant';

export interface IDepositor {
  depositor: string;
  txHash: string;
  amount: number;
  timestamp: string;
}
@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss'],
})
export class DepositorsComponent implements OnInit {
  @Input() proposalId: number;
  voteDataList: IDepositor[] = [];
  loading = true;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.proposalService.getDepositors(this.proposalId).subscribe((res) => {
      this.loading = true;
      if (res?.data?.transactions?.length > 0) {
        res.data.transactions.forEach((trans) => {
          trans = parseDataTransaction(trans, this.coinMinimalDenom);
        });
        this.voteDataList = res.data.transactions.filter(
          (transaction) => transaction?.tx?.body?.messages[0]['@type'] === TRANSACTION_TYPE_ENUM.Deposit,
        );
        this.voteDataList.forEach((item) => {
          item.timestamp = this.datePipe.transform(item.timestamp, DATEFORMAT.DATETIME_UTC);
        });
      }
      this.loading = false;
    });
  }
}
