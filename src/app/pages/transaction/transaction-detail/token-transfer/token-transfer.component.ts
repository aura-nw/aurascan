import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { pipeTypeData } from 'src/app/core/constants/transaction.enum';
import { Globals } from 'src/app/global/global';
import { MatTableDataSource } from '@angular/material/table';
import { TableTemplate } from 'src/app/core/models/common.model';

@Component({
  selector: 'app-token-transfer',
  templateUrl: './token-transfer.component.html',
  styleUrls: ['./token-transfer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TokenTransferComponent implements OnInit {
  @Input() isNFT: boolean;
  // @Input() value: any;
  // @Input() dataLink: any;
  // @Input() denom: any = { display: null, decimal: 6 };
  // @Input() pipeType: string = '';

  pipeTypeData = pipeTypeData;
  dataSource = new MatTableDataSource<any>([]);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  constructor(public global: Globals, public router: Router) {}

  ngOnInit(): void {}
}
