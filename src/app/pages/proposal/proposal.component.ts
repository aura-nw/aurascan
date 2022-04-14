import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Observable, of } from 'rxjs';
import { delay, last, map, take } from 'rxjs/operators';
import { Globals } from '../../../app/global/global';
import { DATEFORMAT } from '../../core/constants/common.constant';
import { PROPOSAL_STATUS, PROPOSAL_VOTE } from '../../core/constants/status.constant';
import { WALLET_PROVIDER } from '../../core/constants/wallet.constant';
import { EnvironmentService } from '../../core/data-services/environment.service';
import { ResponseDto, TableTemplate } from '../../core/models/common.model';
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
  // bread crumb items
  breadCrumbItems!: Array<{}>;
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
  length;
  pageSize = 20;
  pageIndex = 0;
  lastedList = [];

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
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Proposal' }, { label: 'List', active: true }];
    this.getList();

    this.walletService.wallet$.subscribe((wallet) => this.getVotedProposal());
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.proposalService.getProposal(this.pageSize, this.pageIndex).subscribe((res: ResponseDto) => {
      this.dataSource = new MatTableDataSource<any>(res.data);
      this.length = res.data.length;
      this.dataSource.sort = this.sort;
      this.lastedList = res.data;
      this.lastedList.forEach((pro, index) => {
        const totalVoteYes = +pro.pro_votes_yes;
        const totalVoteNo = +pro.pro_votes_no;
        const totalVoteNoWithVeto = +pro.pro_votes_no_with_veto;
        const totalVoteAbstain = +pro.pro_votes_abstain;
        const totalVote = totalVoteYes + totalVoteNo + totalVoteNoWithVeto + totalVoteAbstain;
        pro.pro_votes_yes = (totalVoteYes * 100) / totalVote;
        pro.pro_votes_no = (totalVoteNo * 100) / totalVote;
        pro.pro_votes_no_with_veto = (totalVoteNoWithVeto * 100) / totalVote;
        pro.pro_votes_abstain = (totalVoteAbstain * 100) / totalVote;
        pro.pro_vote_total = totalVote;
        pro.pro_voting_start_time = this.datePipe.transform(pro.pro_voting_start_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_voting_end_time = this.datePipe.transform(pro.pro_voting_end_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_submit_time = this.datePipe.transform(pro.pro_submit_time, DATEFORMAT.DATETIME_UTC);
        pro.pro_total_deposits = balanceOf(pro.pro_total_deposits);
        if (index < 4) {
          this.proposalVotes.push({
            proId: pro.pro_id,
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
              vote: this.voteConstant.find((s) => s.enum === i)?.value || null,
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
    let resObj: { value: string; class: string } = null;
    const statusObj = this.statusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
      };
    }
    return resObj;
  }

  getHighestVote(yes: number, no: number, noWithVeto: number, abstain: number) {
    let highest = Math.max(yes, no, noWithVeto, abstain);
    let resObj: { value: number; name: string; class: string } = null;
    let key;

    if (!highest) {
      highest = 0;
      key = 0;
    } else {
      if (highest === yes) {
        key = 1;
      } else if (highest === no) {
        key = 3;
      } else if (highest === noWithVeto) {
        key = 4;
      } else {
        key = 2;
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

  openVoteDialog(id: string, title: string) {
    if (this.walletService.wallet) {
      let dialogRef = this.dialog.open(ProposalVoteComponent, {
        height: '400px',
        width: '600px',
        data: { id, title, voteValue: this.voteValue },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.voteValue = result;
      });
    } else {
      try {
        const connect = async () => {
          await this.walletService.connect(WALLET_PROVIDER.KEPLR, this.chainId);
        };
        connect();
      } catch (error) {
        console.error(error);
      }
    }
  }

  shortenAddress(address: string): string {
    return shortenAddressStartEnd(address, 6, 10);
  }
}
