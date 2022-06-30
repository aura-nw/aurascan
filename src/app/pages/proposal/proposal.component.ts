import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe, ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { Globals } from '../../../app/global/global';
import { DATEFORMAT, PAGE_EVENT } from '../../core/constants/common.constant';
import { MESSAGE_WARNING, PROPOSAL_STATUS, PROPOSAL_VOTE, VOTING_STATUS } from '../../core/constants/proposal.constant';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { TableTemplate } from '../../core/models/common.model';
import { IProposal } from '../../core/models/proposal.model';
import { DialogService } from '../../core/services/dialog.service';
import { ProposalService } from '../../core/services/proposal.service';
import { WalletService } from '../../core/services/wallet.service';
import { balanceOf } from '../../core/utils/common/parsing';
import { shortenAddressStartEnd } from '../../core/utils/common/shorten';
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
  chainId = this.environmentService.apiUrl.value.chainId;
  // data table
  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'ID' },
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'votingStart', headerCellDef: 'Voting Start' },
    { matColumnDef: 'submitTime', headerCellDef: 'Submit Time' },
    { matColumnDef: 'totalDeposit', headerCellDef: 'Total Deposit' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  length: number;
  pageSize = PAGE_EVENT.PAGE_SIZE;
  pageIndex = 0;
  lastedList: IProposal[] = [];

  proposalVotes: {
    proId: number;
    vote: string | null;
  }[] = [];

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  pageYOffset = 0;
  scrolling = false;
  @HostListener('window:scroll', ['$event']) onScroll(event){
    this.pageYOffset = window.pageYOffset;
  }
  constructor(
    private proposalService: ProposalService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    public global: Globals,
    public walletService: WalletService,
    private environmentService: EnvironmentService,
    private dlgService: DialogService,
    private layout: BreakpointObserver,
    private scroll: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => this.getListProposal());
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getListProposal();
  }

  getListProposal(): void {
    const addr = this.walletService.wallet?.bech32Address || null;
    this.proposalService.getProposalList(addr).subscribe((res) => {
      if (res?.data) {
        this.dataSource = new MatTableDataSource<any>(res.data);
        this.length = res.data.length;
        this.lastedList = [...res.data];
        this.lastedList.forEach((pro, index) => {
          pro.pro_voting_start_time = this.datePipe.transform(pro.pro_voting_start_time, DATEFORMAT.DATETIME_UTC);
          pro.pro_voting_end_time = this.datePipe.transform(pro.pro_voting_end_time, DATEFORMAT.DATETIME_UTC);
          pro.pro_submit_time = this.datePipe.transform(pro.pro_submit_time, DATEFORMAT.DATETIME_UTC);
          pro.pro_total_deposits = balanceOf(pro.pro_total_deposits);

          if (
            (index < 4 && pro?.pro_status !== VOTING_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD) ||
            pro?.pro_status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD
          ) {
            this.getVoteResult(pro.pro_id, index);
            const expiredTime = +moment(pro.pro_voting_end_time).format('x') - +moment().format('x');
            if (expiredTime < 0) {
              this.getProposalDetailFromNode(pro.pro_id, index);
            }
          }
          pro.vote_option = this.voteConstant.find((s) => s.key === pro.vote_option)?.voteOption;
        });
      }
    });
  }

  getProposalDetailFromNode(pro_id, index) {
    this.proposalService.getProposalDetailFromNode(pro_id).subscribe((res) => {
      if (res?.data) {
        this.lastedList[index].pro_status = res.data.status;
        this.dataSource.data[index].pro_status = res.data.status;
      }
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
      key = 'VOTE_OPTION_YES';
    } else {
      if (highest === yes) {
        key = 'VOTE_OPTION_YES';
      } else if (highest === no) {
        key = 'VOTE_OPTION_NO';
      } else if (highest === noWithVeto) {
        key = 'VOTE_OPTION_NO_WITH_VETO';
      } else {
        key = 'VOTE_OPTION_ABSTAIN';
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
    const id = item.pro_id;
    const title = item.pro_title;
    const expiredTime = +moment(item.pro_voting_end_time).format('x') - +moment().format('x');

    if (expiredTime > 0) {
      const account = this.walletService.getAccount();

      if (account) {
        this.proposalService.getStakeInfo(account.bech32Address).subscribe(({ data }) => {
          let warning: MESSAGE_WARNING;

          const { created_at } = data.result ? data.result : { created_at: null };
          warning = created_at
            ? +moment(created_at).format('x') < +moment(item.pro_voting_start_time).format('x')
              ? null
              : MESSAGE_WARNING.LATE
            : MESSAGE_WARNING.NOT_PARTICIPATE;


          this.openDialog({
            id,
            title,
            warning,
            voteValue: warning ? null : item.vote_option,
            idx: index,
          });
        });
      }
    } else {
      this.getProposalDetailFromNode(id, index);
      this.getVoteResult(id, index);
    }
  }

  openDialog(data): void {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      width: data.warning ? '500px' : '431px',
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getVoteResult(data.id, data.idx);
        let votedValue = this.lastedList.find((s)=> s.pro_id === data.id);
        votedValue.vote_option = result.keyVote;
      }
      this.scrollToTop();
    });
  }


  scrollToTop(){
    this.scroll.scrollToPosition([0, 0]);
    this.scrolling = true;
    setTimeout(() => {this.scrolling = !this.scrolling; }, 500);
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

  getVoteResult(pro_id, index) {
    this.proposalService.getProposalTally(pro_id).subscribe((res) => {
      if (!res.data.proposalVoteTally.tally) {
        return;
      }
      const { yes, no, no_with_veto, abstain } = res.data.proposalVoteTally.tally;
      let totalVote = +yes + +no + +no_with_veto + +abstain;

      this.lastedList[index].pro_votes_yes = (+yes * 100) / totalVote;
      this.lastedList[index].pro_votes_no = (+no * 100) / totalVote;
      this.lastedList[index].pro_votes_no_with_veto = (+no_with_veto * 100) / totalVote;
      this.lastedList[index].pro_votes_abstain = (+abstain * 100) / totalVote;
    });
  }
}
