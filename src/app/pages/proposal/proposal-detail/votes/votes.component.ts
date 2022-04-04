import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../../../core/services/proposal.service';

export interface IVotes {
  voter: string;
  txHash: string;
  answer: string;
  time: string;
}

@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.scss'],
})
export class VotesComponent implements OnInit {
  // TABS = ['ALL', 'YES', 'NO', 'NO WITH VETO', 'ABSTAIN', 'DID NOT VOTE']
  TABS = ['ALL', 'YES', 'NO', 'NO WITH VETO', 'ABSTAIN'];

  voteDataList: IVotes[] = [];

  _voteList: IVotes[] = [];

  constructor(private proposalService: ProposalService) {}

  ngOnInit(): void {
    // this.proposalService.getVotes().subscribe((data) => {
    //   this._voteList = data;
    //   this.changeTab(0)
    // });
  }

  changeTab(tabId): void {
    //this.voteDataList = [...this._voteList].slice(tabId * 20, tabId * 20 + 20)
  }
}
