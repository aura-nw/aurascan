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
        proposalId: this.proposalDetail.proposal_id,
      };

      combineLatest([
        this.proposalService
          .getListVoteFromIndexer(payloads, null)
          .pipe(map((item) => ({ nextKey: item.vote[item.vote?.length - 1]?.height, votes: item.vote }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_YES)
          .pipe(map((item) => ({ nextKey: item.vote[item.vote?.length - 1]?.height, votes: item.vote }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO)
          .pipe(map((item) => ({ nextKey: item.vote[item.vote?.length - 1]?.height, votes: item.vote }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO)
          .pipe(map((item) => ({ nextKey: item.vote[item.vote?.length - 1]?.height, votes: item.vote }))),
        this.proposalService
          .getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_ABSTAIN)
          .pipe(map((item) => ({ nextKey: item.vote[item.vote?.length - 1]?.height, votes: item.vote }))),
      ]).subscribe((res) => {
        res[0] && ((dta) => (this.voteData.all = dta))(res[0]);
        res[1] && ((dta) => (this.voteData.yes = dta))(res[1]);
        res[2] && ((dta) => (this.voteData.no = dta))(res[2]);
        res[3] && ((dta) => (this.voteData.noWithVeto = dta))(res[3]);
        res[4] && ((dta) => (this.voteData.abstain = dta))(res[4]);

        let voteData: any[];
        if (this.voteData?.all && !this.countCurrent) {
          voteData = [...this.voteData?.all?.votes];
          this.voteDataList = [...voteData];
        }

        const countAll =
          +this.proposalDetail.count_vote?.yes +
          +this.proposalDetail.count_vote?.abstain +
          +this.proposalDetail.count_vote?.no +
          +this.proposalDetail.count_vote?.no_with_veto;

        this.countVote.set('', countAll);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.proposalDetail.count_vote?.yes);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.proposalDetail.count_vote?.abstain);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.proposalDetail.count_vote?.no);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.proposalDetail.count_vote?.no_with_veto);

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
      proposalId: this.proposalDetail.proposal_id,
      nextKey: null,
    };

    switch ($event.tabId) {
      case VOTE_OPTION.VOTE_OPTION_YES:
        payloads.nextKey = this.voteData.yes.nextKey;
        if (payloads.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, VOTE_OPTION.VOTE_OPTION_YES).subscribe((res) => {
            if (res.vote) {
              if (this.voteData.yes.votes.length % 25 !== res.vote?.length) {
                this.voteData.yes = {
                  nextKey: res.vote[res.vote?.length - 1]?.height,
                  votes: [...this.voteData.yes.votes, ...res.vote],
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
            if (res.vote) {
              if (this.voteData.abstain.votes.length % 25 !== res.vote?.length) {
                this.voteData.abstain = {
                  nextKey: res.vote[res.vote?.length - 1]?.height,
                  votes: [...this.voteData.abstain.votes, ...res.vote],
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
            if (res.vote) {
              if (this.voteData.no.votes.length % 25 !== res.vote?.length) {
                this.voteData.no = {
                  nextKey: res.vote[res.vote?.length - 1]?.height,
                  votes: [...this.voteData.no.votes, ...res.vote],
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
              if (res?.vote) {
                if (this.voteData.noWithVeto.votes.length % 25 !== res?.vote?.length) {
                  this.voteData.noWithVeto = {
                    nextKey: res?.vote[res.vote?.length - 1]?.height,
                    votes: [...this.voteData.noWithVeto.votes, ...res?.vote],
                  };
                }
                this.voteDataList = this.voteData?.noWithVeto?.votes;
              }
            });
        }
        break;
      default:
        payloads.nextKey = this.voteData.all?.nextKey;
        if (payloads?.nextKey) {
          this.proposalService.getListVoteFromIndexer(payloads, null).subscribe((res) => {
            if (res?.vote) {
              if (this.voteData.all.votes.length % 25 !== res?.vote?.length) {
                this.voteData.all = {
                  nextKey: res?.vote[res?.vote?.length - 1]?.height,
                  votes: [...this.voteData.all.votes, ...res?.vote],
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
