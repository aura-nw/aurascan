import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  @Output() totalValue = new EventEmitter<number>();
  @Output() totalAssets = new EventEmitter<number>();

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
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  assetsLoading = true;
  total = 0;
  pageEvent: any;
  paginator: MatPaginator;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';
  constructor(
    public global: Globals,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getTotalAssets();
  }

  ngOnChanges(): void {
    this.getListToken();
  }

  getListToken() {
    this.assetsLoading = true;
    const payload = {
      account_address: this.address,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      keyword: this.textSearch,
    };
    this.accountService.getAssetCW20ByOwner(payload).subscribe((res: ResponseDto) => {
      let data: any;
      if (res?.data?.length > 0) {
        let lstToken = _.get(res, 'data').map((element) => {
          data = element;
          if (data) {
            data.change = data.price_change_percentage_24h;
            data.isValueUp = true;
            if (data.change !== '-' && data.change < 0) {
              data.isValueUp = false;
              data.change = Number(data.change.toString().substring(1));
            }
            if (data.contract_address !== '-') {
              const tempConvert = +data.balance / Math.pow(10, data.decimals || 0);
              data.balance = tempConvert < 0.000001 ? 0 : tempConvert;
            }
          }
          return data;
        });

        lstToken = lstToken.filter((k) => k?.symbol);
        this.dataSource = new MatTableDataSource<any>(lstToken);
        this.pageData.length = res.meta.count;
        this.totalAssets.emit(this.pageData.length);
      } else {
        this.pageData.length = 0;
        this.dataSource.data = [];
      }
      this.assetsLoading = false;
    });
  }

  convertValue(value: any, decimal: number) {
    return balanceOf(value, decimal);
  }

  sortData(sort: Sort) {}

  paginatorEmit(event): void {
    this.paginator = event;
  }

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    this.getKeySearch();
  }

  getKeySearch() {
    this.textSearch = this.textSearch?.trim();
    this.getListToken();
  }

  searchToken(): void {
    if (this.paginator.pageIndex !== 0) {
      this.paginator.firstPage();
    } else {
      this.getKeySearch();
    }
  }

  checkSearch(): void {
    if (this.textSearch.length === 0) {
      this.searchToken();
    }
  }

  resetSearch(): void {
    this.textSearch = '';
    this.pageData.pageIndex = 0;
    this.searchToken();
  }

  getTotalAssets(): void {
    this.accountService.getTotalAssets(this.address).subscribe((res: ResponseDto) => {
      this.total = res.data || 0;
      this.totalValue.emit(this.total);
    });
  }
}
