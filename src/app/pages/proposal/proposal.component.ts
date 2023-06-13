import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from '../../../app/global/global';
import { PROPOSAL_STATUS, PROPOSAL_VOTE, VOTE_OPTION } from '../../core/constants/proposal.constant';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { TableTemplate } from '../../core/models/common.model';
import { IProposal } from '../../core/models/proposal.model';
import { DialogService } from '../../core/services/dialog.service';
import { ProposalService } from '../../core/services/proposal.service';
import { WalletService } from '../../core/services/wallet.service';
import { balanceOf } from '../../core/utils/common/parsing';
import { shortenAddressStartEnd } from '../../core/utils/common/shorten';
import { ProposalVoteComponent } from './proposal-vote/proposal-vote.component';
import { TransactionService } from 'src/app/core/services/transaction.service';

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
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile: any[];
  proposalData: any;
  length: number;
  nextKey = null;
  isLoadingAction = false;
  pageYOffset = 0;
  scrolling = false;

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  proposalVotes: {
    proId: number;
    vote: string | null;
  }[] = [];

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYOffset = window.pageYOffset;
  }
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  constructor(
    private proposalService: ProposalService,
    public dialog: MatDialog,
    public global: Globals,
    public walletService: WalletService,
    private environmentService: EnvironmentService,
    private dlgService: DialogService,
    private layout: BreakpointObserver,
    private scroll: ViewportScroller,
    public commonService: CommonService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    // this.getListProposal();
    this.getListProposal2({ index: 1 });
    this.walletService.wallet$.subscribe((wallet) => this.getFourLastedProposal());
  }

  getFourLastedProposal() {
    let payload = {
      limit: 4,
    };
    this.proposalService.getProposalData(payload).subscribe((res) => {
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
                  limit: 1,
                  compositeKey: 'proposal_vote.proposal_id',
                  value: pro.proposal_id?.toString(),
                  value2: addr,
                };
                this.transactionService.getListTxMultiCondition(payload).subscribe((res) => {
                  const optionVote = this.proposalService.getVoteMessageByConstant(
                    res?.transaction[0]?.data?.tx?.body?.messages[0]?.option,
                  );
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

  getListProposal(nextKey = null) {
    let payload = {
      limit: 40,
      nextKey: nextKey,
    };
    this.proposalService.getProposalData(payload).subscribe((res) => {
      this.nextKey = res.proposal[res.proposal.length - 1].proposal_id;
      if (res?.proposal) {
        let tempDta = res.proposal;
        tempDta.forEach((pro) => {
          pro.total_deposit[0].amount = balanceOf(pro.total_deposit[0].amount);
        });
        if (this.dataSource.data.length > 0) {
          this.dataSource.data = [...this.dataSource.data, ...tempDta];
        } else {
          this.dataSource.data = [...tempDta];
        }
      }
      this.dataSourceMobile = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.length = this.dataSource.data.length;
    });
  }

  getListProposal2({ index }) {
    this.proposalService
      .getProposalData2({
        limit: 10,
        offset: (index - 1) * 10,
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
      key = VOTE_OPTION.VOTE_OPTION_YES;
    } else {
      if (highest === yes) {
        key = VOTE_OPTION.VOTE_OPTION_YES;
      } else if (highest === no) {
        key = VOTE_OPTION.VOTE_OPTION_NO;
      } else if (highest === noWithVeto) {
        key = VOTE_OPTION.VOTE_OPTION_NO_WITH_VETO;
      } else {
        key = VOTE_OPTION.VOTE_OPTION_ABSTAIN;
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

  parsingStatus(sts) {
    return (
      this.voteConstant.find((s) => {
        return s.value?.toUpperCase() === sts?.toUpperCase();
      })?.voteOption || sts
    );
  }

  shortenAddress(address: string): string {
    return shortenAddressStartEnd(address, 6, 10);
  }

  dlgServOpen(): void {
    this.dlgService.showDialog({
      content: 'Please set up override Keplr in settings of Coin98 wallet',
      title: '',
    });
  }

  paginatorEmit(e: MatPaginator): void {
    if (this.dataSource.paginator) {
      e.page.next({
        length: this.dataSource.paginator.length,
        pageIndex: 0,
        pageSize: this.dataSource.paginator.pageSize,
        previousPageIndex: this.dataSource.paginator.pageIndex,
      });
      this.dataSource.paginator = e;
    } else this.dataSource.paginator = e;
  }

  pageEvent2(index: number) {
    // console.log(index);

    // index = index - 1;

    // const { length, pageSize } = this.pageData;
    // const next = length <= (index + 2) * pageSize;
    // this.dataSourceMobile = this.dataSource.data.slice(index * pageSize, index * pageSize + pageSize);

    // if (next && this.nextKey) {
    //   this.getListProposal(this.nextKey);
    // }
    // this.pageData.pageIndex = index;

    this.getListProposal2({ index });
  }

  pageEvent(e: PageEvent): void {
    console.log(e);

    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.dataSourceMobile = this.dataSource.data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

    if (next && this.nextKey) {
      this.getListProposal(this.nextKey);
    }
    this.pageData.pageIndex = e.pageIndex;
  }
}
