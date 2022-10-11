import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';

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

  constructor(private proposalService: ProposalService, private layout: BreakpointObserver) {
    this.proposalService.reloadList$.pipe(debounceTime(3000)).subscribe((event) => {
      if (event) {
        this.getValidatorVotes();
      }
    });
  }

  getValidatorVotes(): void {
    if (this.proposalId) {
      this.proposalService.getValidatorVotesFromIndexer(this.proposalId).subscribe((res) => {
        this.voteDataListLoading = true;

        this.voteData.all = res.data;
        this.voteData.yes = res.data.filter((f) => f.answer === VOTE_OPTION.VOTE_OPTION_YES);
        this.voteData.abstain = res.data.filter((f) => f.answer === VOTE_OPTION.VOTE_OPTION_ABSTAIN);
        this.voteData.no = res.data.filter((f) => f.answer === VOTE_OPTION.VOTE_OPTION_NO);
        this.voteData.noWithVeto = res.data.filter((f) => f.answer === VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO);
        this.voteData.didNotVote = res.data.filter((f) => f.answer === '');
        this.voteDataList = [...this.voteData.all];

        this.countVote.set('', this.voteData.all.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.voteData.yes.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.voteData.abstain.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.voteData.no.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.voteData.noWithVeto.length);
        this.countVote.set('null', this.voteData.didNotVote.length);

        this.voteDataListLoading = false;
      });
    }
  }
  ngOnInit(): void {
    this.getValidatorVotes();
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
    switch (tabId) {
      case '':
        this.voteDataList = this.voteData.all;
        break;
      case VOTE_OPTION.VOTE_OPTION_YES:
        this.voteDataList = this.voteData.yes;
        break;
      case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
        this.voteDataList = this.voteData.abstain;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO:
        this.voteDataList = this.voteData.no;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
        this.voteDataList = this.voteData.noWithVeto;
        break;
      default:
        this.voteDataList = this.voteData.didNotVote;
        break;
    }
  }

  loadMore($event): void {}
}
