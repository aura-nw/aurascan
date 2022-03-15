import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { Router } from '@angular/router';
import { ValidatorService } from '../../../app/core/services/validator.service';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss']
})

export class ValidatorsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank' },
    { matColumnDef: 'title', headerCellDef: 'Validator' },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'percent_power', headerCellDef: 'Cumulative Share %' },
    { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'uptime', headerCellDef: 'Uptime' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
    // { matColumnDef: 'percent_power', headerCellDef: 'Percent Power' },
    // { matColumnDef: 'self_stake', headerCellDef: 'Self Stake' },
    // { matColumnDef: 'fee', headerCellDef: 'fee' },
    // { matColumnDef: 'blocks_proposed', headerCellDef: 'Blocks Proposed' },
    // { matColumnDef: 'delegators', headerCellDef: 'Delegators' },
    // { matColumnDef: 'power_24_change', headerCellDef: 'Power 24 Change' },
    // { matColumnDef: 'governance_votes', headerCellDef: 'Governance Votes' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataSourceBk: MatTableDataSource<any>;
  length;
  pageSize = 1000;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  totalPower = 515;
  isActive = true;
  textSearch = '';
  rawData;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  
  constructor(
    private commonService: CommonService,
    private router: Router,
    private validatorService: ValidatorService
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
    this.validatorService
      .validators()
      .subscribe((res: ResponseDto) => {
        this.rawData = res.data;
        res.data.totalParti = 18;
        res.data.lstValidator.forEach((val) => {
          val.percent_vote = val.power / this.totalPower;
          val.participation = '16' + '/ ' + res.data.totalParti;
          val.uptime = '100%';
        });
        
        let dataFilter = res.data.lstValidator.filter(event => event.status_validator === this.isActive);

        this.dataSource = new MatTableDataSource(dataFilter);
        this.dataSourceBk = this.dataSource;
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }

  changeType(type: boolean): void {
    this.isActive = type;
    let data = this.rawData.lstValidator.filter(event => event.status_validator === this.isActive);
    this.dataSource = new MatTableDataSource(data);
    this.dataSourceBk = this.dataSource;
  }

  searchValidator(): void {
    if (this.textSearch.length > 0) {
      const data = this.dataSource.data.filter((f) =>
        f.title.toLowerCase().indexOf(this.textSearch) > -1 && f.status_validator === this.isActive
      );
      this.dataSource = this.dataSourceBk;
      if (data.length > 0) {
        this.dataSource = new MatTableDataSource(data);
      }
    } else{
      this.dataSource = this.dataSourceBk;
    }
  }
}
