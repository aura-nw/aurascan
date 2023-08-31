import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import BigNumber from 'bignumber.js';
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
  tokenFilter = '';
  textSearch = '';
  searchValue = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'asset', headerCellDef: 'asset' },
    { matColumnDef: 'contractAddress', headerCellDef: 'contractAddress' },
    { matColumnDef: 'price', headerCellDef: 'price' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'value', headerCellDef: 'value' },
  ];

  listTokenType = [
    {
      label: 'All',
      value: '',
      quantity: 0,
    },
    {
      label: 'Native Coin',
      value: 'native',
      quantity: 0,
    },
    {
      label: 'IBC Token',
      value: 'ibc',
      quantity: 0,
    },
    {
      label: 'CW-20 Token',
      value: 'cw20',
      quantity: 0,
    },
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
  dataTable = [];
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';

  constructor(
    public global: Globals,
    private accountService: AccountService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.getTotalAssets();
  }

  ngOnChanges(): void {
    this.getListToken();
  }

  getListToken() {
    const payload = {
      account_address: this.address,
      keyword: this.textSearch,
    };
    if (this.dataTable.length > 0) {
      let searchList;
      // Filter type token
      if (this.tokenFilter !== '') {
        searchList = this.dataTable.filter((item) => item.type?.toLowerCase() === this.tokenFilter);
      }

      // Search with text search
      if (this.textSearch && searchList) {
        const textSearch = this.textSearch.trim();
        searchList = searchList.filter(
          (item) => item.name?.toLowerCase().includes(textSearch.toLowerCase()) || item.contract_address == textSearch,
        );
      } else if (this.tokenFilter === '') {
        const textSearch = this.textSearch.trim();
        searchList = this.dataTable.filter(
          (item) => item.name?.toLowerCase().includes(textSearch.toLowerCase()) || item.contract_address == textSearch,
        );
      }
      this.dataSource.data = [...searchList];
    } else {
      this.accountService.getAssetCW20ByOwner(payload).subscribe(
        (res: ResponseDto) => {
          let data: any;
          if (res?.data?.length > 0) {
            let lstToken = _.get(res, 'data').map((element) => {
              data = element;
              if (data) {
                data.change = data.price_change_percentage_24h;
                data.isValueUp = true;
                data['balance'] = data['balance'] || 0;
                if (data.change !== '-' && data.change < 0) {
                  data.isValueUp = false;
                  data.change = Number(data.change.toString().substring(1));
                }
              }
              return data;
            });

            lstToken = lstToken.filter((k) => k?.symbol);
            // store datatable
            this.dataTable = lstToken;
            // Sort and slice 20 frist record.
            this.dataSource = new MatTableDataSource<any>(lstToken);
            this.pageData.length = res.meta?.count || lstToken?.length;
            this.listTokenType.forEach((e) => {
              if (e.value === '') {
                e.quantity = this.pageData.length;
              } else {
                e.quantity = this.dataTable.filter((ite) => ite.type.toLowerCase() === e.value).length;
              }
            });
          } else {
            this.pageData.length = 0;
            this.dataSource.data = [];
          }
          this.totalAssets.emit(this.pageData.length);
        },
        () => {},
        () => {
          this.assetsLoading = false;
        },
      );
    }
  }

  convertValue(value: any, decimal: number) {
    return balanceOf(value, decimal);
  }

  searchToken(): void {
    this.searchValue = this.searchValue?.trim();
    this.textSearch = this.searchValue?.trim();
    this.getListToken();
  }

  resetSearch(): void {
    this.textSearch = '';
    this.searchValue = '';
    this.searchToken();
  }

  getTotalAssets(): void {
    this.accountService.getTotalAssets(this.address).subscribe((res: ResponseDto) => {
      this.total = res.data || 0;
      this.totalValue.emit(this.total);
    });
  }

  convertSmallNumber(amount: number, decimal: number) {
    let valueString = (new BigNumber(amount).toNumber() / Math.pow(10, decimal)).toString();
    let res = valueString.match(/(.*)e-(\d)/);
    return res ? '0.' + new Array(parseInt(res[2], 10)).join('0') + res[1].replace('.', '') : valueString;
  }
}
