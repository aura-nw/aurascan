import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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

  math = Math;
  textSearch = '';
  searchTemp: string = '';
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
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  assetCW20: any[];
  currentBalance = 0;
  assetsLoading = true;
  total = 0;

  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';

  constructor(
    public global: Globals,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnChanges(): void {
    this.getAccountDetail();
  }

  getListToken() {
    const payload = {
      account_address: this.address,
      limit: 0,
      offset: 0,
      keyword: this.textSearch,
    };
    this.accountService.getAssetCW20ByOwner(payload).subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        if (res?.data) {
          res?.data.unshift({
            name: 'Aura',
            symbol: this.coinInfo.coinDenom,
            image: this.defaultLogoAura,
            contract_address: '',
            balance: this.currentBalance,
            decimals: this.coinInfo.coinDecimals,
            total_supply: 0,
            price: this.global.tokenPrice,
          });
        }

        this.assetCW20 = res?.data;
        this.assetCW20.forEach((item) => {
          this.total += +item.price * +item.balance || 0;
        });
        this.totalValue.emit(this.total);

        this.assetCW20.length = res.data.length;
        this.dataSource = new MatTableDataSource<any>(this.assetCW20);
        this.pageData.length = this.assetCW20?.length;
      } else {
        this.pageData.length = 0;
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
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    this.textSearch = this.textSearch?.trim();
    if (this.textSearch.length > 0) {
      if (regexRule.test(this.textSearch)) {
        this.getListToken();
      }
    } else {
      this.getListToken();
    }
  }

  resetSearch(): void {
    this.textSearch = '';
    this.getListToken();
  }

  getAccountDetail(): void {
    this.assetsLoading = true;
    this.accountService.getAccountDetail(this.address).subscribe((res) => {
      if (res?.data) {
        this.currentBalance = +res?.data.total;
        this.getListToken();
        this.assetsLoading = false;
      }
    });
  }
}
