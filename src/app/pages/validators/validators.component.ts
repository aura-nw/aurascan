import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss']
})
export class validatorsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'operator_address', headerCellDef: 'Address' },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'percent_power', headerCellDef: 'Percent Power' },
    { matColumnDef: 'self_stake', headerCellDef: 'Self Stake' },
    { matColumnDef: 'fee', headerCellDef: 'fee' },
    { matColumnDef: 'blocks_proposed', headerCellDef: 'Blocks Proposed' },
    { matColumnDef: 'delegators', headerCellDef: 'Delegators' },
    // { matColumnDef: 'power_24_change', headerCellDef: 'Power 24 Change' },
    // { matColumnDef: 'governance_votes', headerCellDef: 'Governance Votes' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 1000;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
     // bread crumb items
     breadCrumbItems!: Array<{}>;
  constructor(
    private commonService: CommonService,
    private router: Router,
    ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Validators' },
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
    this.commonService
      .validators()
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }
  openBlockDetail(data){
    this.router.navigate(['validators', data.operator_address]);
  }
}
