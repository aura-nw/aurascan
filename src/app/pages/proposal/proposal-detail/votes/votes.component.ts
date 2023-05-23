import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
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
export class VotesComponent implements OnChanges {
  @Input() proposalDetail;
  @ViewChild('customNav') customNav: NgbNav;

  TABS = PROPOSAL_VOTE.filter((vote) =>
    [
      VOTE_OPTION.VOTE_OPTION_UNSPECIFIED,
      VOTE_OPTION.VOTE_OPTION_YES,
      VOTE_OPTION.VOTE_OPTION_ABSTAIN,
      VOTE_OPTION.VOTE_OPTION_NO,
      VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO,
    ].includes(vote.key),
  ).map((vote) => ({
    ...vote,
    value: vote.value.toUpperCase(),
    key: vote.key === VOTE_OPTION.VOTE_OPTION_UNSPECIFIED ? '' : vote.key,
  }));

  voteDataList: IVotes[] = [];
  countVote: Map<string, number> = new Map<string, number>();
  countCurrent: string = '';
  voteDataListLoading = true;
  isFirstChange = false;
  TAB_ALL = 0;
  proposalVote = PROPOSAL_TABLE_MODE.VOTES;

  voteData = {
    all: null,
    yes: null,
    abstain: null,
    no: null,
    noWithVeto: null,
  };

  countTotal = {
    all: 0,
    yes: 0,
    abstain: 0,
    no: 0,
    noWithVeto: 0,
  };
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(private proposalService: ProposalService, private layout: BreakpointObserver) {
    this.proposalService.reloadList$.pipe(debounceTime(3000)).subscribe((event) => {
      if (event) {
        this.getVotesList();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proposalDetail'].currentValue?.proposal_id && !this.isFirstChange) {
      this.isFirstChange = true;
      this.getVotesList();
    }
  }

  getVotesList(): void {
    if (this.proposalDetail?.proposal_id) {
      const payloads: IListVoteQuery = {
        pageLimit: 25,
        proposalid: this.proposalDetail.proposal_id,
      };

      this.proposalDetail?.total_vote?.forEach((f) => {
        switch (f.answer) {
          case VOTE_OPTION.VOTE_OPTION_YES:
            this.countTotal.yes = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
            this.countTotal.abstain = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_NO:
            this.countTotal.no = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
            this.countTotal.noWithVeto = f.count;
            break;
        }
      });

      combineLatest([
        this.proposalService
          .getListVoteFromIndexer(payloads, null)
          .pipe(map((item) => ({ nextKey: item.data.nextKey, votes: item.data.votes }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_YES)
          .pipe(map((item) => ({ nextKey: item.data.nextKey, votes: item.data.votes }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO)
          .pipe(map((item) => ({ nextKey: item.data.nextKey, votes: item.data.votes }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO)
          .pipe(map((item) => ({ nextKey: item.data.nextKey, votes: item.data.votes }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_ABSTAIN)
          .pipe(map((item) => ({ nextKey: item.data.nextKey, votes: item.data.votes }))),
      ]).subscribe((res) => {
        this.voteDataListLoading = true;
        res[0] && ((dta) => (this.voteData.all = dta))(res[0]);
        res[1] && ((dta) => (this.voteData.yes = dta))(res[1]);
        res[2] && ((dta) => (this.voteData.no = dta))(res[2]);
        res[3] && ((dta) => (this.voteData.noWithVeto = dta))(res[3]);
        res[4] && ((dta) => (this.voteData.abstain = dta))(res[4]);

        let voteData: any[];
        if (this.voteData?.all) {
          voteData = [...this.voteData?.all.votes];
        }
        if (voteData) {
          voteData.forEach((item: any) => {
            item.voter = item.tx_response?.tx?.body?.messages[0]?.voter;
            item.tx_hash = item.tx_response?.txhash;
            item.option = item.tx_response?.tx?.body?.messages[0]?.option;
            item.updated_at = item.tx_response?.timestamp;
          });
        }

        this.countTotal.all =
          this.countTotal.yes + this.countTotal.no + this.countTotal.noWithVeto + this.countTotal.abstain;

        this.voteDataList = [...voteData];

        this.countVote.set('', this.countTotal?.all);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.countTotal?.yes);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.countTotal?.abstain);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.countTotal?.no);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.countTotal?.noWithVeto);

        this.voteDataListLoading = false;
        this.changeTab(this.countCurrent);
      });
    }
  }

  changeTab(tabId): void {
    if (this.countCurrent !== tabId) {
      this.proposalService.pageIndexObj['votes'] = {};
    }
    this.countCurrent = tabId;
    switch (tabId) {
      case VOTE_OPTION.VOTE_OPTION_YES:
        this.voteDataList = this.voteData.yes.votes;
        break;
      case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
        this.voteDataList = this.voteData.abstain.votes;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO:
        this.voteDataList = this.voteData.no.votes;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
        this.voteDataList = this.voteData.noWithVeto.votes;
        break;
      default:
        this.voteDataList = this.voteData.all.votes;
        break;
    }
  }

  loadMore($event): void {
    const payloads: IListVoteQuery = {
      pageLimit: 25,
      proposalid: this.proposalDetail.proposal_id,
      nextKey: null,
    };

    switch ($event.tabId) {
      case VOTE_OPTION.VOTE_OPTION_YES:
        payloads.nextKey = this.voteData.yes.nextKey;
        if (payloads.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_YES).subscribe((res) => {
            if (res.data.votes) {
              if (this.voteData.yes.votes.length % 25 !== res.data.votes.length) {
                this.voteData.yes = {
                  nextKey: res.data.nextKey,
                  votes: [...this.voteData.yes.votes, ...res.data.votes],
                };
              }
              this.voteDataList = this.voteData?.yes.votes;
            }
          });
        }
        break;
      case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
        payloads.nextKey = this.voteData.abstain.nextKey;
        if (payloads.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_ABSTAIN).subscribe((res) => {
            if (res.data.votes) {
              if (this.voteData.abstain.votes.length % 25 !== res.data.votes.length) {
                this.voteData.abstain = {
                  nextKey: res.data.nextKey,
                  votes: [...this.voteData.abstain.votes, ...res.data.votes],
                };
              }
              this.voteDataList = this.voteData?.abstain.votes;
            }
          });
        }
        break;
      case VOTE_OPTION.VOTE_OPTION_NO:
        payloads.nextKey = this.voteData.no.nextKey;
        if (payloads.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO).subscribe((res) => {
            if (res.data.votes) {
              if (this.voteData.no.votes.length % 25 !== res.data.votes.length) {
                this.voteData.no = {
                  nextKey: res.data.nextKey,
                  votes: [...this.voteData.no.votes, ...res.data.votes],
                };
              }
              this.voteDataList = this.voteData?.no.votes;
            }
          });
        }
        break;
      case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
        payloads.nextKey = this.voteData.noWithVeto.nextKey;
        if (payloads.nextKey) {
          this.proposalService
            .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO)
            .subscribe((res) => {
              if (res.data.votes) {
                if (this.voteData.noWithVeto.votes.length % 25 !== res.data.votes.length) {
                  this.voteData.noWithVeto = {
                    nextKey: res.data.nextKey,
                    votes: [...this.voteData.noWithVeto.votes, ...res.data.votes],
                  };
                }
                this.voteDataList = this.voteData?.noWithVeto.votes;
              }
            });
        }
        break;
      default:
        payloads.nextKey = this.voteData.all?.nextKey;
        if (payloads?.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, null).subscribe((res) => {
            if (res.data.votes) {
              if (this.voteData.all.votes.length % 25 !== res.data.votes.length) {
                this.voteData.all = {
                  nextKey: res.data.nextKey,
                  votes: [...this.voteData.all.votes, ...res.data.votes],
                };
              }
              this.voteDataList = this.voteData?.all.votes;
            }
          });
        }
        break;
    }
  }
}
