import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { Router } from '@angular/router';
import { BlockService } from '../../../app/core/services/block.service';

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
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
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
    private blockService: BlockService,
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
    this.blockService
      .blocks(this.pageSize, this.pageIndex)
      .subscribe(res => {
        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
      }
      );
  }
  openBlockDetail(event: any, data: any) {
    const linkValidator = event?.target.classList.contains('validator-link');
    const linkBlock = event?.target.classList.contains('block-link');
    if (linkValidator) {
      this.router.navigate(['validators', data.operator_address]);
    } else if (linkBlock) {
      this.router.navigate(['blocks', data.height]);
    }
  }
}
