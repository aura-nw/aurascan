import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PAGE_SIZE_OPTIONS } from '../../../app/core/constants/common.constant';
import { TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';

@Component({
  selector: 'app-chanels',
  templateUrl: './chanels.component.html',
  styleUrls: ['./chanels.component.scss']
})
export class ChanelsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'Chanel Name' },
    { matColumnDef: 'num_blocks', headerCellDef: 'Blocks' },
    { matColumnDef: 'num_txs', headerCellDef: 'Transactions' },
    { matColumnDef: 'channel_genesis_hash', headerCellDef: 'Chanel genesis hash' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Chanels' },
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
      .channels(this.pageSize, this.pageIndex)
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.data.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }

  openDetail(data) {
    // this.router.navigate(['chanels', data.tx_hash]);
  }
}
