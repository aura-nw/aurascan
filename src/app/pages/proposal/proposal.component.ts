import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as moment from 'moment';
import { tap } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from '../../../app/global/global';
import { PROPOSAL_STATUS, PROPOSAL_VOTE, VOTE_OPTION } from '../../core/constants/proposal.constant';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { TableTemplate } from '../../core/models/common.model';
import { IProposal } from '../../core/models/proposal.model';
import { ProposalService } from '../../core/services/proposal.service';
import { WalletService } from '../../core/services/wallet.service';
import { balanceOf } from '../../core/utils/common/parsing';
import { ProposalVoteComponent } from './proposal-vote/proposal-vote.component';

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss'],
})
export class ProposalComponent implements OnInit {
  statusConstant = PROPOSAL_STATUS;
  voteConstant = PROPOSAL_VOTE;
  voteValue: { keyVote: number } = null;
  chainId = this.environmentService.configValue.chainId;
  // data table
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'ID' },
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'votingStart', headerCellDef: 'Voting Start' },
    { matColumnDef: 'submitTime', headerCellDef: 'Submit Time' },
    { matColumnDef: 'totalDeposit', headerCellDef: 'Total Deposit' },
  ];

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((state) => {
      this.pageData = {
        length: PAGE_EVENT.LENGTH,
        pageSize: state.matches ? 5 : 10,
        pageIndex: 1,
      };

      this.getListProposal({ index: 1 });
    }),
  );

  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  proposalData: any;
  length: number;
  nextKey = null;
  scrolling = false;

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: this.layout.isMatched([Breakpoints.Small, Breakpoints.XSmall]) ? 5 : 10,
    pageIndex: 1,
  };
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  constructor(
    private proposalService: ProposalService,
    public dialog: MatDialog,
    public global: Globals,
    public walletService: WalletService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private scroll: ViewportScroller,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => this.getFourLastedProposal());
  }

  getFourLastedProposal() {
    this.proposalService
      .getProposalData({
        limit: 4,
      })
      .subscribe((res) => {
        if (res?.proposal) {
          const addr = this.walletService.wallet?.bech32Address || null;
          this.proposalData = res.proposal;
          if (this.proposalData?.length > 0) {
            this.proposalData.forEach((pro, index) => {
              if (pro?.tally) {
                const { yes, no, no_with_veto, abstain } = pro?.tally;
                let totalVote = +yes + +no + +no_with_veto + +abstain;
                if (this.proposalData[index].tally && totalVote > 0) {
                  this.proposalData[index].tally.yes = (+yes * 100) / totalVote;
                  this.proposalData[index].tally.no = (+no * 100) / totalVote;
                  this.proposalData[index].tally.no_with_veto = (+no_with_veto * 100) / totalVote;
                  this.proposalData[index].tally.abstain = (+abstain * 100) / totalVote;
                }
              }
              const getVoted = async () => {
                if (addr) {
                  const payload = {
                    proposal_id: pro.proposal_id?.toString(),
                    address: addr,
                  };
                  this.proposalService.getVotedResult(payload).subscribe((res) => {
                    const optionVote = this.proposalService.getVoteMessageByConstant(res?.vote[0]?.vote_option);
                    pro.vote_option = this.voteConstant.find((s) => s.key === optionVote)?.voteOption;
                  });
                }
              };
              getVoted();
            });
          }
        }
      });
  }

  getListProposal({ index }) {
    this.proposalService
      .getProposalData({
        limit: this.pageData.pageSize,
        offset: (index - 1) * this.pageData.pageSize,
      })
      .subscribe((res) => {
        if (res?.proposal) {
          let tempDta = res.proposal;
          tempDta.forEach((pro) => {
            pro.total_deposit[0].amount = balanceOf(pro.total_deposit[0].amount);
          });

          this.dataSource.data = tempDta;
        }
        this.length = res.proposal_aggregate.aggregate.count;
      });
  }

  getStatus(key: string) {
    let resObj: { value: string; class: string; key: string } = null;
    const statusObj = this.statusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
        key: statusObj.key,
      };
    }
    return resObj;
  }

  getHighestVote(yes: number, no: number, noWithVeto: number, abstain: number) {
    let highest = Math.max(yes, no, noWithVeto, abstain);
    let resObj: { value: number; name: string; class: string } = null;
    let key: string;

    if (!highest || highest > 100) {
      highest = 0;
      key = VOTE_OPTION.YES;
    } else {
      if (highest === yes) {
        key = VOTE_OPTION.YES;
      } else if (highest === no) {
        key = VOTE_OPTION.NO;
      } else if (highest === noWithVeto) {
        key = VOTE_OPTION.NO_WITH_VETO;
      } else {
        key = VOTE_OPTION.ABSTAIN;
      }
    }

    const statusObj = this.voteConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: highest,
        class: statusObj.class,
        name: statusObj.voteOption,
      };
    }
    return resObj;
  }

  openVoteDialog(item: IProposal, index: number) {
    const id = item.proposal_id;
    const title = item.content.title;
    const expiredTime = +moment(item.voting_end_time).format('x') - +moment().format('x');

    if (expiredTime > 0) {
      const account = this.walletService.getAccount();
      if (account) {
        this.openDialog({
          id,
          title,
          voteValue: item.vote_option || null,
          idx: index,
        });
      }
    } else {
      this.getFourLastedProposal();
    }
  }

  openDialog(data): void {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      width: '431px',
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.scrollToTop();
      setTimeout(() => {
        this.getFourLastedProposal();
      }, 3000);
    });
  }

  scrollToTop() {
    this.scroll.scrollToPosition([0, 0]);
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = !this.scrolling;
    }, 500);
  }
}
