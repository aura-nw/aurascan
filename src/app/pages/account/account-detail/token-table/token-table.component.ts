import { Component, Input, OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { ResponseDto, TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-token-table',
  templateUrl: './token-table.component.html',
  styleUrls: ['./token-table.component.scss'],
})
export class TokenTableComponent implements OnChanges {
  @Input() address: string;
  math = Math;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'chance', headerCellDef: 'chance' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);

  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  sortedData: any;
  sort: MatSort;
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  assetCW20: any[];
  constructor(public global: Globals, private accountService: AccountService) {}

  ngOnChanges(): void {
    this.getListToken();
  }

  getListToken() {
    const payload = {
      account_address: this.address,
      limit: 0,
      offset: 0,
      keyword: '',
    };
    this.accountService.getAssetCW20ByOnwer(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        this.assetCW20 = res?.data;
        this.assetCW20.length = res.data.length;
        this.dataSource = new MatTableDataSource<any>(this.assetCW20);
        this.pageData.length = this.assetCW20?.length;
      }
    });
  }

  convertValue(value: any, decimal: number) {
    return balanceOf(value, decimal);
  }

  sortData(sort: Sort) {}
  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
  handlePageEvent(e: any) {
    this.pageData = e;
  }
  searchToken(): void {
    if (this.textSearch.length > 0) {
      const payload = {
        account_address: this.address,
        limit: 0,
        offset: 0,
        keyword: this.textSearch,
      };

      this.accountService.getAssetCW20ByOnwer(payload).subscribe((res: ResponseDto) => {
        if (res?.data?.length > 0) {
          let keyWord = this.textSearch.toLowerCase();
          this.filterSearchData = res.data?.filter(
            (data) => data.name.toLowerCase().includes(keyWord) || data.symbol.toLowerCase().includes(keyWord),
          );
        }
      });
    }
  }
}
