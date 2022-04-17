import { Component, Input, OnInit } from '@angular/core';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { PROPOSAL_VOTE } from '../../../../core/constants/proposal.constant';
import { IListVoteQuery } from '../../../../core/models/proposal.model';

export interface IValidatorVotes {
  rank: number;
  validator_name: string;
  txHash: string;
  option: string;
  created_at: string;
}

@Component({
  selector: 'app-validators-votes',
  templateUrl: './validators-votes.component.html',
  styleUrls: ['./validators-votes.component.scss'],
})
export class ValidatorsVotesComponent implements OnInit {
  @Input() proposalId: number;
  TABS = PROPOSAL_VOTE.concat({
    key: 'null',
    value: 'Did not vote',
    class: '',
    voteOption: '',
  })
    .filter((vote) =>
      [
        'VOTE_OPTION_UNSPECIFIED',
        'VOTE_OPTION_YES',
        'VOTE_OPTION_ABSTAIN',
        'VOTE_OPTION_NO',
        'VOTE_OPTION_NO_WITH_VETO',
        'null',
      ].includes(vote.key),
    )
    .map((vote) => ({
      ...vote,
      value: vote.value.toUpperCase(),
      key: vote.key === 'VOTE_OPTION_UNSPECIFIED' ? '' : vote.key,
    }));

  voteDataList: IValidatorVotes[] = [];

  _voteList: IValidatorVotes[] = [];

  LIMIT_DEFAULT = 45;

  query = [];

  voteData = {
    all: null,
    yes: null,
    abstain: null,
    no: null,
    noWithVeto: null,
    didNotVote: null,
  };

  constructor(private proposalService: ProposalService) {}

  ngOnInit(): void {
    if (this.proposalId) {
      const payloads: IListVoteQuery[] = this.TABS.map((vote) => ({
        limit: this.LIMIT_DEFAULT,
        offset: 0,
        option: vote.key,
        proposalId: this.proposalId,
      }));

      this.query = payloads;

      merge(
        this.proposalService
          .getValidatorVotes(payloads[0])
          .pipe(map((item) => ({ all: item.data.result.proposalVotes }))),
        this.proposalService
          .getValidatorVotes(payloads[1])
          .pipe(map((item) => ({ yes: item.data.result.proposalVotes }))),
        this.proposalService
          .getValidatorVotes(payloads[2])
          .pipe(map((item) => ({ abstain: item.data.result.proposalVotes }))),
        this.proposalService
          .getValidatorVotes(payloads[3])
          .pipe(map((item) => ({ no: item.data.result.proposalVotes }))),
        this.proposalService
          .getValidatorVotes(payloads[4])
          .pipe(map((item) => ({ noWithVeto: item.data.result.proposalVotes }))),
        this.proposalService
          .getValidatorVotes(payloads[5])
          .pipe(map((item) => ({ didNotVote: item.data.result.proposalVotes }))),
      ).subscribe((res) => {
        res['all'] && ((dta) => (this.voteData.all = dta))(res['all']);
        res['yes'] && ((dta) => (this.voteData.yes = dta))(res['yes']);
        res['abstain'] && ((dta) => (this.voteData.abstain = dta))(res['abstain']);
        res['no'] && ((dta) => (this.voteData.no = dta))(res['no']);
        res['noWithVeto'] && ((dta) => (this.voteData.noWithVeto = dta))(res['noWithVeto']);
        res['didNotVote'] && ((dta) => (this.voteData.didNotVote = dta))(res['didNotVote']);

        if (res['all']) {
          this.voteDataList = [...this.voteData.all];
        }
      });
    }
  }

  changeTab(tabId): void {
    switch (tabId) {
      case '':
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
      default:
        this.voteDataList = this.voteData.didNotVote;
        break;
    }
  }
}
