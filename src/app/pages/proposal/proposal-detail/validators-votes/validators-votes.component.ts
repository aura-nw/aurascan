import { Component, Input, OnInit } from '@angular/core';
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
  @Input() proposalId: number;
  _voteList: IValidatorVotes[] = [];

  constructor(private proposalService: ProposalService) {}
  ngOnInit(): void {
    let payLoad = {
      proposalId: this.proposalId,
      option: '',
      limit: 5,
      offset: 0,
    };
    this.proposalService.getValidatorVotes(payLoad).subscribe((res) => {
      this._voteList = res.data.result.proposalVotes;
      this.changeTab(0);
    });
  }
  changeTab(tabId): void {
    let data = {
      proposalId: this.proposalId,
      option: '',
      limit: 5,
      offset: 0,
    };
    switch (tabId) {
      case 1:
        data.option = 'VOTE_OPTION_YES';
        break;
      case 2:
        data.option = 'VOTE_OPTION_NO';
        break;
      case 3:
        data.option = 'VOTE_OPTION_NO_WITH_VETO';
        break;
      case 4:
        data.option = 'VOTE_OPTION_ABSTAIN';
        break;
      default:
        data.option = '';
        break;
    }
    this.proposalService.getValidatorVotes(data).subscribe((res) => {
      this._voteList = res.data.result.proposalVotes;
    });
    this.voteDataList = [...this._voteList];
  }
}
