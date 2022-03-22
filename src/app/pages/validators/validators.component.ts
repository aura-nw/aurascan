import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonDataDto, ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { Globals } from '../../../app/global/global';

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
    // { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'up_time', headerCellDef: 'Uptime' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
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
  sortedData;
  dataHeader = new CommonDataDto();
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor(
    private validatorService: ValidatorService,
    private commonService: CommonService,
    public globals: Globals
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Validators' },
      { label: 'List', active: true }
    ];
    this.getList();

    setInterval(() => {
      this.getList();
    }, 20000);
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
        res.data.forEach((val) => {
          val.percent_vote = val.power / this.totalPower;
          val.participation = '16' + '/ ' + 18;
        });

        let dataFilter = res.data.filter(event => event.status_validator === this.isActive);
        //sort and calculator cumulative
        let dataSort = this.calculatorCumulative(dataFilter);
        this.dataSource = new MatTableDataSource(dataSort);
        this.dataSourceBk = this.dataSource;
        this.dataSource.sort = this.sort;
      }
      );
  }

  changeType(type: boolean): void {
    this.isActive = type;
    let data = this.rawData.filter(event => event.status_validator === this.isActive);
    this.dataSource = new MatTableDataSource(data);
    this.dataSourceBk = this.dataSource;
  }

  sortData(sort: Sort) {
    let data = this.rawData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title': return this.compare(a.title, b.title, isAsc);
        case 'power': return this.compare(a.power, b.power, isAsc);
        case 'participation': return this.compare(a.participation, b.participation, isAsc);
        case 'uptime': return this.compare(a.uptime, b.uptime, isAsc);
        case 'commission': return this.compare(a.commission, b.commission, isAsc);
        default: return 0;
      }
    });

    let dataFilter = this.sortedData.filter(event => event.status_validator === this.isActive);
    //sort and calculator cumulative
    let dataSort = this.calculatorCumulative(dataFilter);
    this.dataSource = new MatTableDataSource(dataSort);
    this.dataSource.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  calculatorCumulative(dataFilter) {
    for (const key in dataFilter) {
      const dataOrigin = dataFilter[key];
      const dataBefore = dataFilter[parseInt(key) - 1];
      if (dataOrigin?.title) {
        if (parseInt(key) === 0) {
          dataOrigin.cumulative_share_before = '0.00';
          dataOrigin.cumulative_share = dataOrigin.percent_power;
          dataOrigin.cumulative_share_after = dataOrigin.percent_power;
        } else {
          dataOrigin.cumulative_share_before = dataBefore?.cumulative_share_after || 0;
          dataOrigin.cumulative_share = dataOrigin?.percent_power;
          const cumulative = parseFloat(dataOrigin?.cumulative_share_before) + parseFloat(dataOrigin?.percent_power);
          dataOrigin.cumulative_share_after = cumulative.toFixed(2);
        }
        dataFilter.cumulative_share_before = dataOrigin.cumulative_share_before;
        dataFilter.cumulative_share = dataOrigin.cumulative_share;
        dataFilter.cumulative_share_after = dataOrigin.cumulative_share_after;
      }
    }
    return dataFilter;
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
    } else {
      this.dataSource = this.dataSourceBk;
    }
  }
}
