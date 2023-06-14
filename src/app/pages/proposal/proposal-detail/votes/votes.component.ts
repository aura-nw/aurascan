import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
  isFirstChange = false;
  PROPOSAL_TABLE_MODE_VOTES = PROPOSAL_TABLE_MODE.VOTES;

  currentTabId = 'all';

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private proposalService: ProposalService,
    private layout: BreakpointObserver,
    private cdr: ChangeDetectorRef,
  ) {
    // this.proposalService.reloadList$.pipe(debounceTime(3000)).subscribe((event) => {
    //   if (event) {
    //     this.getVotesList();
    //   }
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proposalDetail'].currentValue?.proposal_id && !this.isFirstChange) {
      this.isFirstChange = true;
      const payloads = {
        pageLimit: 5,
        proposalId: this.proposalDetail.proposal_id,
        offset: 0,
        pageIndex: 0,
      };

      this.proposalService.getListVoteFromIndexer2(payloads, null).subscribe((res) => {
        this.voteDataListLoading = false;
        this.voteDataList = res.vote;
      });

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
  }

  changeTab(tabId): void {
    this.pageEventChange({ tabId, pageIndex: 0, pageSize: 5 });
  }

  pageEventChange({ tabId, pageIndex, pageSize }: any) {
    const payloads = {
      pageLimit: pageSize,
      proposalId: this.proposalDetail.proposal_id,
      offset: pageSize * pageIndex,
      pageIndex,
    };

    const voteOption = tabId === 'all' ? null : tabId;

    if (this.currentTabId !== tabId) {
      this.currentTabId = tabId || 'all';
    }

    this.proposalService.getListVoteFromIndexer2(payloads, voteOption).subscribe((res) => {
      this.voteDataList = res.vote;
    });

    return;
  }
}
