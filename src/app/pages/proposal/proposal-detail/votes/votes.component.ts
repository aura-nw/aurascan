import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges } from '@angular/core';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { PROPOSAL_VOTE, VOTE_OPTION } from '../../../../core/constants/proposal.constant';
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
  query = [];

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

  constructor(private proposalService: ProposalService, private layout: BreakpointObserver) {}

  ngOnChanges(): void {
    if (this.proposalDetail?.proposal_id) {
      const payloads: IListVoteQuery[] = this.TABS.map((vote) => ({
        pageLimit: 5,
        proposalId: this.proposalDetail.proposal_id,
      }));
      this.query = payloads;
      this.proposalDetail?.total_vote.forEach((f) => {
        this.countTotal.all += f.count;
        switch (f.answer) {
          case VOTE_OPTION.VOTE_OPTION_YES:
            this.countTotal.yes = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
            this.countTotal.no = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_NO:
            this.countTotal.abstain = f.count;
            break;
          case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
            this.countTotal.noWithVeto = f.count;
            break;
        }
      });

      merge(
        this.proposalService.getListVoteFromIndexer(payloads[0], null).pipe(map((item) => ({ all: item.data }))),
        this.proposalService.getListVoteFromIndexer(payloads[1], 1).pipe(map((item) => ({ yes: item.data }))),
        this.proposalService.getListVoteFromIndexer(payloads[2], 3).pipe(map((item) => ({ no: item.data }))),
        this.proposalService.getListVoteFromIndexer(payloads[3], 4).pipe(map((item) => ({ noWithVeto: item.data }))),
        this.proposalService.getListVoteFromIndexer(payloads[4], 2).pipe(map((item) => ({ abstain: item.data }))),
      ).subscribe((res) => {
        this.voteDataListLoading = true;
        res['all'] && ((dta) => (this.voteData.all = dta))(res['all']);
        res['yes'] && ((dta) => (this.voteData.yes = dta))(res['yes']);
        res['no'] && ((dta) => (this.voteData.no = dta))(res['no']);
        res['noWithVeto'] && ((dta) => (this.voteData.noWithVeto = dta))(res['noWithVeto']);
        res['abstain'] && ((dta) => (this.voteData.abstain = dta))(res['abstain']);

        if (this.voteData?.all?.transactions) {
          this.voteDataList = [...this.voteData?.all?.transactions];
        }
        if (this.voteDataList) {
          this.voteDataList.forEach((item: any) => {
            item.voter = item.tx_response?.tx?.body?.messages[0]?.voter;
            item.tx_hash = item.tx_response?.txhash;
            item.option = item.tx_response?.tx?.body?.messages[0]?.option;
            item.updated_at = item.tx_response?.timestamp;
          });
        }
        this.countVote.set('', this.countTotal?.all);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_YES, this.countTotal?.yes);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_ABSTAIN, this.countTotal?.abstain);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO, this.countTotal?.no);
        this.countVote.set(VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO, this.countTotal?.noWithVeto);
        this.voteDataListLoading = false;
      });
    }
  }

  changeTab(tabId): void {
    this.countCurrent = tabId;
    switch (tabId) {
      case '':
        this.voteDataList = this.voteData.all.transactions;
        break;
      case VOTE_OPTION.VOTE_OPTION_YES:
        this.voteDataList = this.voteData.yes.transactions;
        break;
      case VOTE_OPTION.VOTE_OPTION_ABSTAIN:
        this.voteDataList = this.voteData.abstain.transactions;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO:
        this.voteDataList = this.voteData.no.transactions;
        break;
      case VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO:
        this.voteDataList = this.voteData.noWithVeto.transactions;
        break;
    }

    if (this.voteDataList) {
      this.voteDataList.forEach((item: any) => {
        item.voter = item.tx_response?.tx?.body?.messages[0]?.voter;
        item.tx_hash = item.tx_response?.txhash;
        item.option = item.tx_response?.tx?.body?.messages[0]?.option;
        item.updated_at = item.tx_response?.timestamp;
      });
    }
  }
}
