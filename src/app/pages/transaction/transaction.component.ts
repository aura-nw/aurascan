import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';


@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Block Height' },
    { matColumnDef: 'tx_hash', headerCellDef: 'Transaction Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
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
      { label: 'Transaction' },
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
      .txs(this.pageSize, this.pageIndex)
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }

  openTxsDetail(data) {
    this.router.navigate(['transaction', data.tx_hash]);
  }
}
