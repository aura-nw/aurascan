import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { Globals } from 'src/app/global/global';
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

  length: number;
  pageSize = 20;
  loading = true;

  constructor(private blockService: BlockService, public commonService: CommonService, private globals: Globals) {}

  ngOnInit(): void {
    this.getList();
  }

  getList(): void {
    this.blockService.blocksLastest(this.pageSize).subscribe((res) => {
      console.log(res);
      
      this.loading = true;
      this.getInfoCommon();
      if (res?.data?.length > 0) {
        this.dataSource = new MatTableDataSource(res.data);
        console.log(this.dataSource);
        
        this.dataBlock = res.data;
        this.length = res?.data?.length;
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
