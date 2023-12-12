import { Component, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { convertDataBlock } from 'src/app/global/global';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
})
export class BlocksComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'COMMON.HEIGHT' },
    { matColumnDef: 'block_hash', headerCellDef: 'LABEL.BLOCK_HASH' },
    { matColumnDef: 'proposer', headerCellDef: 'LABEL.PROPOSER' },
    { matColumnDef: 'num_txs', headerCellDef: 'LABEL.TXS' },
    { matColumnDef: 'timestamp', headerCellDef: 'COMMON.TIME' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  pageSize = 20;
  loading = true;
  errTxt: string;

  constructor(private blockService: BlockService) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    const payload = {
      limit: this.pageSize,
    };
    this.blockService.getDataBlock(payload).subscribe({
      next: (res) => {
        if (res?.block?.length > 0) {
          const blocks = convertDataBlock(res);
          this.dataSource = new MatTableDataSource(blocks);
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
