import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../../../../app/core/services/proposal.service';

export interface IDepositor {
  depositors: string;
  txHash: string;
  amount: string;
  time: string;
}
@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss'],
})
export class DepositorsComponent implements OnInit {
  voteDataList: IDepositor[] = [];

  _voteList: IDepositor[] = [];
  constructor(private proposalService: ProposalService) {}
  ngOnInit(): void {
    // this.proposalService.getDepositors().subscribe((data) => {
    //   this._voteList = data;
    //   this.changeTab(0);
    // });
  }
  changeTab(tabId): void {
    //this.voteDataList = [...this._voteList].slice(tabId * 8, tabId * 8 + 8);
  }
}
