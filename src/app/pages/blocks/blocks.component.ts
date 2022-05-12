import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
})
export class BlocksComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'block_hash_format', headerCellDef: 'Block Hash' },
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataBlock: any[];

  length: number;
  pageSize = 20;
  pageIndex = 0;
  loading = true;
  constructor(private router: Router, private blockService: BlockService, public commonService: CommonService) {}

  ngOnInit(): void {
    this.getList();
  }
  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.blockService.blocks(this.pageSize, this.pageIndex * this.pageSize).subscribe((res) => {
      this.loading = true;
      if (res?.data?.length > 0) {
        res.data.forEach((block) => {
          block.block_hash_format = block.block_hash.replace(
            block.block_hash.substring(6, block.block_hash.length - 6),
            '...',
          );
        });
        this.dataSource = new MatTableDataSource(res.data);
        this.dataBlock = res.data;
        this.length = res.meta.count;
      }
      this.loading = false;
    });
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
