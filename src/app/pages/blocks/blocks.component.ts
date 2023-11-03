import { Component, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { Globals, convertDataBlock } from 'src/app/global/global';
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
    { matColumnDef: 'block_hash', headerCellDef: 'Block Hash' },
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  pageSize = 20;
  loading = true;
  errTxt: string;

  constructor(private blockService: BlockService, public commonService: CommonService, private globals: Globals) {}

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

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res);
    });
  }
}
