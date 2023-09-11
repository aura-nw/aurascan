import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-transfer',
  templateUrl: './token-transfer.component.html',
  styleUrls: ['./token-transfer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TokenTransferComponent implements OnInit {
  @Input() isNFT: boolean;
  dataSource = new MatTableDataSource<any>([]);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  templatesFTs: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];
  displayedColumnsFTs: string[] = this.templatesFTs.map((dta) => dta.matColumnDef);

  constructor(public global: Globals, public router: Router) {}

  ngOnInit(): void {}
}
