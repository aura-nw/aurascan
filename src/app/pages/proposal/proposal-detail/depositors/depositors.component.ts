import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { DATEFORMAT } from '../../../../core/constants/common.constant';
import { balanceOf } from '../../../../core/utils/common/parsing';

export interface IDepositor {
  depositors: string;
  txHash: string;
  amount: number;
  created_at: string;
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

  constructor(
    private proposalService: ProposalService,
    private datePipe: DatePipe,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.proposalService.getDepositors(this.proposalId).subscribe((res) => {
      this.loading = true;
      if (res?.data) {
        this.voteDataList = [...res.data.result];
        this.voteDataList.forEach((item) => {
          item.amount = balanceOf(item.amount);
          item.created_at = this.datePipe.transform(item.created_at, DATEFORMAT.DATETIME_UTC);
        });
      }
      this.loading = false;
    });
  }
}
