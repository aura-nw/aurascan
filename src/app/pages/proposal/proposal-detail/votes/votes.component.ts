import { Component, Input, OnInit } from '@angular/core';
import { concat, merge } from 'rxjs';
import { concatAll, concatMap, map } from 'rxjs/operators';
import { PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { IListVoteQuery } from '../../../../core/models/proposal.model';
import { ProposalService } from '../../../../core/services/proposal.service';
export interface IVotes {
  id: number;
  proposal_id: number;
  voter: string;
  tx_hash: string;
  option: string;
  created_at: string;
}

@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.scss'],
})
export class VotesComponent implements OnInit {
  @Input() proposalId: number = null;

  TABS = PROPOSAL_VOTE.filter((vote) =>
    [
      'VOTE_OPTION_UNSPECIFIED',
      'VOTE_OPTION_YES',
      'VOTE_OPTION_ABSTAIN',
      'VOTE_OPTION_NO',
      'VOTE_OPTION_NO_WITH_VETO',
    ].includes(vote.key),
  ).map((vote) => ({ ...vote, value: vote.value.toUpperCase() }));

  voteDataList: IVotes[] = [];

  _voteList: IVotes[] = [];

  LIMIT_DEFAULT = 45;

  query = [];

  voteData = {
    all: null,
    yes: null,
    abstain: null,
    no: null,
    noWithVeto: null,
  };

  constructor(private proposalService: ProposalService) {}

  ngOnInit(): void {
    console.log(this.query);
    if (this.proposalId) {
      const payloads: IListVoteQuery[] = this.TABS.map((vote) => ({
        limit: this.LIMIT_DEFAULT,
        offset: 0,
        option: vote.key,
        proposalId: this.proposalId,
      }));

      this.query = payloads;

      merge(
        this.proposalService.getListVote(payloads[0]).pipe(map((item) => ({ all: item.data.result }))),
        this.proposalService.getListVote(payloads[1]).pipe(map((item) => ({ yes: item.data.result }))),
        this.proposalService.getListVote(payloads[2]).pipe(map((item) => ({ abstain: item.data.result }))),
        this.proposalService.getListVote(payloads[3]).pipe(map((item) => ({ no: item.data.result }))),
        this.proposalService.getListVote(payloads[4]).pipe(map((item) => ({ noWithVeto: item.data.result }))),
      ).subscribe((res) => {
        res['all'] && ((dta) => (this.voteData.all = dta))(res['all']);
        res['yes'] && ((dta) => (this.voteData.yes = dta))(res['yes']);
        res['abstain'] && ((dta) => (this.voteData.abstain = dta))(res['abstain']);
        res['no'] && ((dta) => (this.voteData.no = dta))(res['no']);
        res['noWithVeto'] && ((dta) => (this.voteData.noWithVeto = dta))(res['noWithVeto']);

        this.voteDataList = this.voteData.all;
      });
    }
  }

  changeTab(tabId): void {
    let payload = this.query[tabId];
    switch (tabId) {
      case 'VOTE_OPTION_UNSPECIFIED':
        this.voteDataList = this.voteData.all;
        break;
      case 'VOTE_OPTION_YES':
        this.voteDataList = this.voteData.yes;
        break;
      case 'VOTE_OPTION_ABSTAIN':
        this.voteDataList = this.voteData.abstain;
        break;
      case 'VOTE_OPTION_NO':
        this.voteDataList = this.voteData.no;
        break;
      case 'VOTE_OPTION_NO_WITH_VETO':
        this.voteDataList = this.voteData.noWithVeto;
        break;
    }
  }
}
