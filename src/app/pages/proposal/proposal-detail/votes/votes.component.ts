import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PROPOSAL_TABLE_MODE, PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
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
export class VotesComponent implements OnChanges, OnDestroy {
  @Input() proposalDetail;
  @ViewChild('customNav') customNav: NgbNav;

  TABS = PROPOSAL_VOTE.filter((vote) =>
    [VOTE_OPTION.UNSPECIFIED, VOTE_OPTION.YES, VOTE_OPTION.ABSTAIN, VOTE_OPTION.NO, VOTE_OPTION.NO_WITH_VETO].includes(
      vote.key,
    ),
  ).map((vote) => ({
    ...vote,
    value: vote.value.toUpperCase(),
    key: vote.key === VOTE_OPTION.UNSPECIFIED ? '' : vote.key,
  }));

  voteDataList: IVotes[] = [];
  countVote: Map<string, number> = new Map<string, number>();

  voteDataListLoading = true;
  PROPOSAL_TABLE_MODE_VOTES = PROPOSAL_TABLE_MODE.VOTES;

  currentTabId = 'all';
  payloads: { pageIndex?: number; pageLimit?: number; proposalId?: number | string; offset?: number };

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  destroyed$ = new Subject<void>();

  constructor(private proposalService: ProposalService, private layout: BreakpointObserver) {
    this.proposalService.reloadList$.pipe(takeUntil(this.destroyed$)).subscribe((event) => {
      if (event) {
        this.getProposalVoteTotal();

        this.pageEventChange({
          tabId: this.currentTabId,
          pageIndex: this.payloads?.pageIndex || 0,
          pageSize: this.payloads?.pageLimit || 5,
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proposalDetail'].currentValue?.proposal_id !== changes['proposalDetail'].previousValue?.proposal_id) {
      this.pageEventChange({ tabId: 'all', pageIndex: 0, pageSize: 5 });
      this.getProposalVoteTotal();
    }
  }

  getProposalVoteTotal() {
    this.proposalService.getProposalVoteTotal(this.proposalDetail.proposal_id).subscribe({
      next: (res) => {
        if (res) {
          this.countVote.set('', res['ALL']?.aggregate.count || 0);
          this.countVote.set(VOTE_OPTION.YES, res[VOTE_OPTION.YES]?.aggregate.count || 0);
          this.countVote.set(VOTE_OPTION.ABSTAIN, res[VOTE_OPTION.ABSTAIN]?.aggregate.count || 0);
          this.countVote.set(VOTE_OPTION.NO, res[VOTE_OPTION.NO]?.aggregate.count || 0);
          this.countVote.set(VOTE_OPTION.NO_WITH_VETO, res[VOTE_OPTION.NO_WITH_VETO]?.aggregate.count || 0);
        }

        this.voteDataListLoading = false;
      },
      error: (error) => {
        this.voteDataListLoading = true;
      },
    });
  }

  changeTab(tabId): void {
    this.pageEventChange({ tabId, pageIndex: 0, pageSize: 5 });
  }

  pageEventChange({ tabId, pageIndex, pageSize }: any) {
    this.payloads = {
      pageLimit: pageSize,
      proposalId: this.proposalDetail.proposal_id,
      offset: pageSize * pageIndex,
      pageIndex,
    };

    const voteOption = tabId === 'all' ? null : tabId;

    if (this.currentTabId !== tabId) {
      this.currentTabId = tabId || 'all';
    }

    this.proposalService.getListVoteFromIndexer(this.payloads, voteOption).subscribe((res) => {
      this.voteDataList = res.vote;
    });
  }
}
