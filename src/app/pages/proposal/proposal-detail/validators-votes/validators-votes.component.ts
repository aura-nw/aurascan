import { Component, OnInit } from '@angular/core';
import { ProposalService } from '../../../../../app/core/services/proposal.service';

export interface IValidatorVotes {
  rank: string;
  validator: string;
  txHash: string;
  answer: string;
  time: string;
}

@Component({
  selector: 'app-validators-votes',
  templateUrl: './validators-votes.component.html',
  styleUrls: ['./validators-votes.component.scss'],
})
export class ValidatorsVotesComponent implements OnInit {
  TABS = ['ALL', 'YES', 'NO', 'NO WITH VETO', 'ABSTAIN', 'DID NOT VOTE'];
  voteDataList: IValidatorVotes[] = [];

  _voteList: IValidatorVotes[] = [];
  constructor(private proposalService: ProposalService) {}
  ngOnInit(): void {
    // this.proposalService.getValidatorVotes().subscribe((data) => {
    //   this._voteList = data;
    //   this.changeTab(0);
    // });
  }
  changeTab(tabId): void {
    //this.voteDataList = [...this._voteList].slice(tabId * 8, tabId * 8 + 8);
  }
}
