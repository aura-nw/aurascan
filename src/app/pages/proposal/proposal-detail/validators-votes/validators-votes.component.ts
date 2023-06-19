import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
import { ValidatorService } from 'src/app/core/services/validator.service';

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
export class ValidatorsVotesComponent implements OnInit, OnDestroy {
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
    // key: vote.key === VOTE_OPTION.UNSPECIFIED ? '' : vote.key,
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

  currentTabId = VOTE_OPTION.UNSPECIFIED;

  destroyed$ = new Subject();

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private validatorService: ValidatorService,
  ) {
    this.proposalService.reloadList$.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
      if (event) {
        this.getValidatorVotes();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
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
        .pipe(
          mergeMap((res) => {
            if (!res) {
              throw new Error();
            }

            const validator = res.validator;
            const operatorAddressList = validator.map((validator) => validator.operator_address);

            return this.validatorService.getValidatorInfoByList(operatorAddressList).pipe(
              map((validatorInfo) => {
                const validatorsMap = validator.map((item, index) => {
                  const validator_name = item.description?.moniker;
                  const timestamp = _.get(item, 'vote[0].updated_at');
                  const vote_option = _.get(item, 'vote[0].vote_option');
                  const txhash = _.get(item, 'vote[0].txhash');
                  const operator_address = _.get(item, 'operator_address');
                  const validator_identity = _.get(item, 'description.identity');
                  const rank = index + 1;
                  const image_url =
                    _.find(validatorInfo.data, { operator_address })?.image_url || 'validator-default.svg';

                  return {
                    validator_name,
                    timestamp,
                    vote_option,
                    txhash,
                    operator_address,
                    validator_identity,
                    rank,
                    image_url,
                  };
                });
                return validatorsMap || null;
              }),
            );
          }),
        )
        .subscribe(
          (validatorVote) => {
            this.voteDataListLoading = false;
            this.loadValidatorVotes(validatorVote);
          },
          (_error) => {
            this.voteDataListLoading = false;

            this.countVote.set(VOTE_OPTION.UNSPECIFIED, 0);
            this.countVote.set(VOTE_OPTION.YES, 0);
            this.countVote.set(VOTE_OPTION.ABSTAIN, 0);
            this.countVote.set(VOTE_OPTION.NO, 0);
            this.countVote.set(VOTE_OPTION.NO_WITH_VETO, 0);
            this.countVote.set(VOTE_OPTION.NULL, 0);
          },
        );
    }
  }

  loadValidatorVotes(validatorVote) {
    this.voteData[VOTE_OPTION.UNSPECIFIED] = validatorVote;
    this.voteData[VOTE_OPTION.YES] = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.YES);
    this.voteData[VOTE_OPTION.ABSTAIN] = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.ABSTAIN);
    this.voteData[VOTE_OPTION.NO] = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.NO);
    this.voteData[VOTE_OPTION.NO_WITH_VETO] = validatorVote.filter((f) => f.vote_option === VOTE_OPTION.NO_WITH_VETO);
    this.voteData[VOTE_OPTION.NULL] = validatorVote.filter((f) => !f.vote_option || f.vote_option === '');

    this.voteDataList = validatorVote;

    this.voteDataList = this.voteData[this.currentTabId];

    this.countVote.set(VOTE_OPTION.UNSPECIFIED, this.voteData[VOTE_OPTION.UNSPECIFIED].length);
    this.countVote.set(VOTE_OPTION.YES, this.voteData[VOTE_OPTION.YES].length);
    this.countVote.set(VOTE_OPTION.ABSTAIN, this.voteData[VOTE_OPTION.ABSTAIN].length);
    this.countVote.set(VOTE_OPTION.NO, this.voteData[VOTE_OPTION.NO].length);
    this.countVote.set(VOTE_OPTION.NO_WITH_VETO, this.voteData[VOTE_OPTION.NO_WITH_VETO].length);
    this.countVote.set(VOTE_OPTION.NULL, this.voteData[VOTE_OPTION.NULL].length);
  }

  changeTab(tabId): void {
    this.currentTabId = tabId;
    this.voteDataList = this.voteData[tabId];
  }

  pageEventChange(e) {
    this.getValidatorVotes(e?.tabId === VOTE_OPTION.UNSPECIFIED ? '' : e?.tabId);
  }
}
