import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {TableTemplate} from "../../core/models/common.model";
import {PageEvent} from "@angular/material/paginator";
import {ProposalService} from "../../core/services/proposal.service";
import {MatSort} from "@angular/material/sort";
import { PROPOSAL_STATUS } from 'src/app/core/constants/status.constant';
import {MatDialog} from "@angular/material/dialog";
import {ProposalVoteComponent} from "./proposal-vote/proposal-vote.component";

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss']
})
export class ProposalComponent implements OnInit {
  statusConstant = PROPOSAL_STATUS;
  voteAvailable = true;
  voteValue: {keyVote: number} = null;
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
    { matColumnDef: 'totalDeposit', headerCellDef: 'Total Deposit' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 20;
  pageIndex = 0;
  lastedList = [];

  constructor(
      private proposalService: ProposalService,
      public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Proposal' },
      { label: 'List', active: true }
    ];
    this.getList();
  }

  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.proposalService
        .getProposal(this.pageSize, this.pageIndex)
        .subscribe(res => {
          this.dataSource = new MatTableDataSource<any>(res);
          this.length = res.length;
          this.dataSource.sort = this.sort;
        })
    this.proposalService
        .getLastedProposal()
        .subscribe(res => {
          this.lastedList = res
        })
  }

  getStatus(key: string) {
    let resObj: {value: string, class: string} = null;
    const statusObj = this.statusConstant.find(s => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class
      }
    }
    return resObj;
  }

  filterGetHighestVote(voteResult: {yes: number, no: number, noWithVeto: number, abstain: number}) {
    let Sorted = Object.entries(voteResult).sort((prev, next) => prev[1] - next[1])
    return Sorted[3];
  }

  openVoteDialog(id: string, title: string) {
    let dialogRef = this.dialog.open(ProposalVoteComponent, {
      height: '400px',
      width: '600px',
      data: {id, title, voteValue: this.voteValue},
    });
    dialogRef.afterClosed().subscribe(result => {
      this.voteValue = result;
    });
  }


}
