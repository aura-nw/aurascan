import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { convertDataBlock, Globals } from 'src/app/global/global';
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
  dataBlock: any[];

  pageSize = 20;
  loading = true;

  coinDecimals = this.environmentService.configValue.chain_info.currencies[0].coinDecimals;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;

  constructor(
    private blockService: BlockService,
    public commonService: CommonService,
    private globals: Globals,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.blockService.blocksIndexer(this.pageSize).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        const blocks = convertDataBlock(data);
        this.dataSource = new MatTableDataSource(blocks);
      }
      this.loading = false;
    });
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res.data);
    });
  }
}
