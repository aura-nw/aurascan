import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Block Height' },
    { matColumnDef: 'block_hash', headerCellDef: 'Block Hash' },
    // { matColumnDef: 'peer_name', headerCellDef: 'Peer Name' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 10;
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
      { label: 'Blocks' },
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
      .blocks(this.pageSize, this.pageIndex)
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }
  openBlockDetail(data){
    this.router.navigate(['blocks', data.height]);
  }
}
