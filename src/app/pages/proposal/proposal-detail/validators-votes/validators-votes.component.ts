import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
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
  PROPOSAL_VOTE_EXT = PROPOSAL_VOTE.concat({
    key: VOTE_OPTION.VOTE_OPTION_NULL,
    value: 'Did not vote',
    class: '',
    voteOption: '',
  });

  TABS = this.PROPOSAL_VOTE_EXT.filter((vote) =>
    [
      VOTE_OPTION.VOTE_OPTION_UNSPECIFIED,
      VOTE_OPTION.VOTE_OPTION_YES,
      VOTE_OPTION.VOTE_OPTION_ABSTAIN,
      VOTE_OPTION.VOTE_OPTION_NO,
      VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO,
      VOTE_OPTION.VOTE_OPTION_NULL,
    ].includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value.toUpperCase(),
    key: vote.key === VOTE_OPTION.VOTE_OPTION_UNSPECIFIED ? '' : vote.key,
  }));

  voteDataList: IValidatorVotes[] = [];
  voteDataListLoading = true;
  countVote: Map<string, number> = new Map<string, number>();
  countCurrent: string = '';
  LIMIT_DEFAULT = 10000;
  query = [];

  voteData = {
    all: null,
    yes: null,
    abstain: null,
    no: null,
    noWithVeto: null,
    didNotVote: null,
  };
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(private proposalService: ProposalService, private layout: BreakpointObserver) {}

  ngOnInit(): void {
    // if (this.proposalId) {
    //   const payloads: IListVoteQuery[] = this.TABS.map((vote) => ({
    //     limit: this.LIMIT_DEFAULT,
    //     offset: 0,
    //     option: vote.key,
    //     proposalId: this.proposalId,
    //   }));

    //   this.query = payloads;

    //   merge(
    //     this.proposalService.getValidatorVotes(payloads[0]).pipe(map((item) => ({ all: item.data.result }))),
    //     this.proposalService.getValidatorVotes(payloads[1]).pipe(map((item) => ({ yes: item.data.result }))),
    //     this.proposalService.getValidatorVotes(payloads[2]).pipe(map((item) => ({ no: item.data.result }))),
    //     this.proposalService.getValidatorVotes(payloads[3]).pipe(map((item) => ({ noWithVeto: item.data.result }))),
    //     this.proposalService.getValidatorVotes(payloads[4]).pipe(map((item) => ({ abstain: item.data.result }))),
    //     this.proposalService.getValidatorVotes(payloads[5]).pipe(map((item) => ({ didNotVote: item.data.result }))),
    //   ).subscribe((res) => {
    //     this.voteDataListLoading = true;
    //     res['all'] && ((dta) => (this.voteData.all = dta))(res['all']);
    //     res['yes'] && ((dta) => (this.voteData.yes = dta))(res['yes']);
    //     res['abstain'] && ((dta) => (this.voteData.abstain = dta))(res['abstain']);
    //     res['no'] && ((dta) => (this.voteData.no = dta))(res['no']);
    //     res['noWithVeto'] && ((dta) => (this.voteData.noWithVeto = dta))(res['noWithVeto']);
    //     res['didNotVote'] && ((dta) => (this.voteData.didNotVote = dta))(res['didNotVote']);

    //     if (res['all']) {
    //       this.voteDataList = [...this.voteData.all.proposalVotes];

    //       this.countVote.set('', this.voteData.all.countTotal);
    //       this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.voteData.all.countYes);
    //       this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.voteData.all.countAbstain);
    //       this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.voteData.all.countNo);
    //       this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.voteData.all.countNoWithVeto);
    //       this.countVote.set('null', this.voteData.all.countDidNotVote);
    //     }
    //     this.voteDataListLoading = false;
    //   });
    // }
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
    switch (tabId) {
      case '':
        this.voteDataList = this.voteData.all.proposalVotes;
        break;
      case VOTE_OPTION.VOTE_OPTION_YES:
        this.voteDataList = this.voteData.yes.proposalVotes;
        break;
      case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
        this.voteDataList = this.voteData.abstain.proposalVotes;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO:
        this.voteDataList = this.voteData.no.proposalVotes;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
        this.voteDataList = this.voteData.noWithVeto.proposalVotes;
        break;
      default:
        this.voteDataList = this.voteData.didNotVote.proposalVotes;
        break;
    }
  }

  loadMore($event): void {}
}
