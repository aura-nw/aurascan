import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Globals } from '../../../app/global/global';
import { DATEFORMAT } from '../../core/constants/common.constant';
import { MESSAGE_WARNING, PROPOSAL_STATUS, PROPOSAL_VOTE } from '../../core/constants/proposal.constant';
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
  @ViewChild(MatSort) sort: MatSort;
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
  dataSource: MatTableDataSource<any>;
  length: number;
  pageSize = 20;
  pageIndex = 0;
  lastedList: IProposal[] = [];

  proposalVotes: {
    proId: number;
    vote: string | null;
  }[] = [];

  constructor(
    private proposalService: ProposalService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    public global: Globals,
    public walletService: WalletService,
    private environmentService: EnvironmentService,
    private dlgServ: DialogService 
  ) {}

  ngOnInit(): void {
    this.getList();
    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.proposalService.getProposal().subscribe((res) => {
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.length = res.data.length;
      this.dataSource.sort = this.sort;
      this.lastedList = [...res.data];
      this.lastedList.forEach((pro, index) => {
        if (index < 4) {
          const expiredTime = new Date(pro.pro_voting_end_time).getTime() - new Date().getTime();
          if (expiredTime < 0 && pro.pro_status !== 'PROPOSAL_STATUS_DEPOSIT_PERIOD') {
            pro.pro_status = 'PROPOSAL_STATUS_REJECTED';
          }

          this.proposalService.getProposalTally(pro.pro_id).subscribe((res) => {
            if (!res.data.proposalVoteTally.tally) {
              return;
            }
            const { yes, no, no_with_veto, abstain } = res.data.proposalVoteTally.tally;
            let totalVote = +yes + +no + +no_with_veto + +abstain;

            pro.pro_votes_yes = (+yes * 100) / totalVote;
            pro.pro_votes_no = (+no * 100) / totalVote;
            pro.pro_votes_no_with_veto = (+no_with_veto * 100) / totalVote;
            pro.pro_votes_abstain = (+abstain * 100) / totalVote;
          });
        }

        pro.pro_voting_start_time = this.datePipe.transform(pro.pro_voting_start_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_voting_end_time = this.datePipe.transform(pro.pro_voting_end_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_submit_time = this.datePipe.transform(pro.pro_submit_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_total_deposits = balanceOf(pro.pro_total_deposits);

        if (index < 4) {
          this.proposalVotes.push({
            proId: +pro.pro_id,
            vote: null,
          });
        }
      });
      this.getVotedProposal();
    });
  }

  getVotedProposal() {
    const addr = this.walletService.wallet?.bech32Address || null;
    if (this.proposalVotes.length > 0 && addr) {
      forkJoin({
        0: this.proposalService.getVotes(this.proposalVotes[0]?.proId, addr),
        1: this.proposalService.getVotes(this.proposalVotes[1]?.proId, addr),
        2: this.proposalService.getVotes(this.proposalVotes[2]?.proId, addr),
        3: this.proposalService.getVotes(this.proposalVotes[3]?.proId, addr),
      })
        .pipe(map((item) => Object.keys(item).map((u) => item[u].data?.proposalVote?.option)))
        .subscribe((res) => {
          this.proposalVotes = res.map((i, idx) => {
            return {
              proId: this.proposalVotes[idx].proId,
              vote: this.voteConstant.find((s) => s.key === i)?.value || null,
            };
          });
        });
    } else {
      this.proposalVotes = this.proposalVotes.map((e) => ({
        ...e,
        vote: null,
      }));
    }
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
        name: statusObj.value,
      };
    }
    return resObj;
  }

  openVoteDialog(item: IProposal, index: number) {
    const id = item.pro_id;
    const title = item.pro_title;
    const expiredTime = new Date(item.pro_voting_end_time).getTime() - new Date().getTime();

    if (expiredTime > 0) {
      const account = this.walletService.getAccount();

      if (account) {
        this.proposalService.getStakeInfo(account.bech32Address).subscribe(({ data }) => {
          let warning: MESSAGE_WARNING;

          const { created_at } = data.result ? data.result : { created_at: null };

          warning = created_at
            ? new Date(created_at) < new Date(item.pro_voting_start_time)
              ? null
              : MESSAGE_WARNING.LATE
            : MESSAGE_WARNING.NOT_PARTICIPATE;

          this.openDialog({
            id,
            title,
            warning,
            voteValue: warning
              ? null
              : this.parsingStatus(this.proposalVotes.find((item) => item.proId === +id)?.vote || null),
            idx: index
          });
        });
      }
    } else {
      this.getList();
    }
  }

  openDialog(data): void {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      width: data.warning ? '500px' : '431px',
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.proposalVotes[data.idx].vote = result.keyVote;
      }
    });
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
    this.dlgServ.showDialog({
      content: 'Please set up override Keplr in settings of Coin98 wallet',
      title: '',
    })
  }
}
