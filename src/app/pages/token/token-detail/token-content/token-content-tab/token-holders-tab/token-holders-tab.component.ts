import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { TokenService } from 'src/app/core/services/token.service';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { Globals } from '../../../../../../global/global';

@Component({
  selector: 'app-token-holders-tab',
  templateUrl: './token-holders-tab.component.html',
  styleUrls: ['./token-holders-tab.component.scss'],
})
export class TokenHoldersTabComponent implements OnInit {
  @Input() keyWord = '';
  @Input() contractAddress: string;
  @Input() isNFTContract: boolean;
  loading = true;

  CW20Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank' },
    { matColumnDef: 'owner', headerCellDef: 'address' },
    { matColumnDef: 'balance', headerCellDef: 'amount' },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];

  CW721Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank' },
    { matColumnDef: 'owner', headerCellDef: 'address' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage' },
  ];

  template: Array<TableTemplate> = [];
  displayedColumns: string[];
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  tokenType = ContractRegisterType.CW20;
  numberTopHolder = 100;

  constructor(public global: Globals, private tokenService: TokenService) {}

  ngOnInit(): void {
    if (this.isNFTContract) {
      this.tokenType = ContractRegisterType.CW721;
    }
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
    this.getListTokenHolder(this.tokenType);
  }

  getListTokenHolder(tokenType: string) {
    this.loading = true;
    this.tokenService
      .getListTokenHolder(
        this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize,
        tokenType,
        this.contractAddress,
      )
      .subscribe((res) => {
        if (res && res.data?.resultAsset?.length > 0) {
          this.pageData.length = res.data?.resultCount;
          res.data?.resultAsset.forEach((element) => {
            element['value'] = 0;
          });
          let sortedData = res.data?.resultAsset.sort((a, b) => {
            return this.compare(a.percent_hold, b.percent_hold, false);
          });
          this.dataSource = new MatTableDataSource<any>(sortedData);
        }
        this.loading = false;
      });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    return this.isNFTContract ? this.CW721Templates : this.CW20Templates;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListTokenHolder(this.tokenType);
  }
}
