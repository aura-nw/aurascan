import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';

@Component({
  selector: 'app-chaincodes',
  templateUrl: './chaincodes.component.html',
  styleUrls: ['./chaincodes.component.scss']
})
export class ChaincodesComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'Chanincode Name' },
    // { matColumnDef: 'channel_genesis_hash', headerCellDef: 'Chanel Name' },
    { matColumnDef: 'path', headerCellDef: 'Path' },
    // { matColumnDef: 'abc', headerCellDef: 'Transactions Count' },
    { matColumnDef: 'version', headerCellDef: 'Version' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Chaincodes' },
      { label: 'List', active: true }
    ];
    this.getList();
  }
  changePage(page: any): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.commonService
      .chaincodes(this.pageSize, this.pageIndex * this.pageSize)
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.data.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }

  openDetail(data) {
    // this.router.navigate(['transaction', data.tx_hash]);
  }
}
