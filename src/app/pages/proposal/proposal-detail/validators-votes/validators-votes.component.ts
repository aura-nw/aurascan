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
    key: VOTE_OPTION.NULL,
    value: 'Did not vote',
    class: '',
    voteOption: '',
  });

  TABS = this.PROPOSAL_VOTE_EXT.filter((vote) =>
    [
      VOTE_OPTION.UNSPECIFIED,
      VOTE_OPTION.YES,
      VOTE_OPTION.ABSTAIN,
      VOTE_OPTION.NO,
      VOTE_OPTION.NO_WITH_VETO,
      VOTE_OPTION.NULL,
    ].includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value.toUpperCase(),
    key: vote.key === VOTE_OPTION.UNSPECIFIED ? '' : vote.key,
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

  ngOnInit(): void {
    this.getValidatorVotes();
  }

  getValidatorVotes(voteOption = null): void {
    if (this.proposalId) {
      this.proposalService
        .getValidatorVotesFromIndexer2(this.proposalId, {
          limit: 100,
          voteOption,
        })
        .subscribe(
          (res) => {
            this.voteDataListLoading = false;
            this.loadValidatorVotes(res?.validator);
          },
          () => {},
          () => {
            this.voteDataListLoading = false;
          },
        );
    }
  }

  loadValidatorVotes(validator) {
    let validatorVote = [];
    if (validator) {
      validatorVote = validator.map((item) => {
        const validator_name = item.description?.moniker;
        const timestamp = _.get(item, 'vote[0].updated_at');
        const vote_option = _.get(item, 'vote[0].vote_option');
        const txhash = _.get(item, 'vote[0].txhash');
        const operator_address = _.get(item, 'operator_address');
        const validator_identity = _.get(item, 'description.identity');
        return { validator_name, timestamp, vote_option, txhash, operator_address, validator_identity };
      });
    }

    this.voteData.all = validatorVote;
    this.voteData.yes = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.YES);
    this.voteData.abstain = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.ABSTAIN);
    this.voteData.no = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.NO);
    this.voteData.noWithVeto = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.NO_WITH_VETO);
    this.voteData.didNotVote = validatorVote.filter((f) => f.vote_option === '');

    this.voteDataList = validatorVote;

    this.countVote.set('', this.voteData.all.length);
    this.countVote.set(VOTE_OPTION.YES, this.voteData.yes.length);
    this.countVote.set(VOTE_OPTION.ABSTAIN, this.voteData.abstain.length);
    this.countVote.set(VOTE_OPTION.NO, this.voteData.no.length);
    this.countVote.set(VOTE_OPTION.NO_WITH_VETO, this.voteData.noWithVeto.length);
    this.countVote.set('null', this.voteData.didNotVote.length);
  }

  changeTab(tabId): void {
    // this.pageEventChange({ tabId, pageIndex: 0, pageSize: 5 });
    this.voteDataList = this.voteData.yes;
  }

  pageEventChange(e) {
    this.getValidatorVotes(e?.tabId);
  }
}
