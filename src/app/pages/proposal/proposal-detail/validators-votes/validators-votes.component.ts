import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
import * as _ from 'lodash';

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
  @ViewChild('customNav') customNav: NgbNav;
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
  tabAll = 0;
  proposalValidatorVote = PROPOSAL_TABLE_MODE.VALIDATORS_VOTES;

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

  getValidatorVotes(isInit = false): void {
    if (this.proposalId) {
      this.proposalService.getValidatorVotesFromIndexer(this.proposalId).subscribe((res) => {
        let validatorVote = [];
        if (res?.validator) {
          validatorVote = _.get(res, 'validator').map((item) => {
            const validator_name = item.description?.moniker;
            const timestamp = _.get(item, 'vote[0].updated_at');
            const vote_option = _.get(item, 'vote[0].vote_option');
            const txhash = _.get(item, 'vote[0].txhash');
            return { validator_name, timestamp, vote_option, txhash };
          });
        }
        this.voteDataListLoading = true;

        this.voteData.all = validatorVote;
        this.voteData.yes = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.VOTE_OPTION_YES);
        this.voteData.abstain = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.VOTE_OPTION_ABSTAIN);
        this.voteData.no = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.VOTE_OPTION_NO);
        this.voteData.noWithVeto = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO);
        this.voteData.didNotVote = validatorVote.filter((f) => f.vote_option === '');
        this.voteDataList = [...this.voteData.all];

        this.countVote.set('', this.voteData.all.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.voteData.yes.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.voteData.abstain.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.voteData.no.length);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.voteData.noWithVeto.length);
        this.countVote.set('null', this.voteData.didNotVote.length);

        this.voteDataListLoading = false;
        this.changeTab(this.countCurrent);
      });
    }
    isInit && this.customNav?.select(this.tabAll);
  }

  ngOnInit(): void {
    this.getValidatorVotes(true);
  }

  changeTab(tabId): void {
    if (this.countCurrent !== tabId) {
      this.proposalService.pageIndexObj['validator_votes'] = {};
    }
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
}
