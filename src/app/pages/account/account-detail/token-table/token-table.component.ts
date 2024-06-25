import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import * as _ from 'lodash';
import { COIN_TOKEN_TYPE, PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ETokenCoinType, MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import { balanceOf } from 'src/app/core/utils/common/parsing';

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
  tokenFilterItem = null;
  textSearch = '';
  searchValue = '';
  errTxt: string;

  COIN_TOKEN_TYPE = COIN_TOKEN_TYPE;
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
      label: ETokenCoinType.NATIVE,
      value: COIN_TOKEN_TYPE.NATIVE,
      quantity: 0,
    },
    {
      label: ETokenCoinType.IBC,
      value: COIN_TOKEN_TYPE.IBC,
      quantity: 0,
    },
    {
      label: ETokenCoinType.CW20,
      value: COIN_TOKEN_TYPE.CW20,
      quantity: 0,
    },
    {
      label: ETokenCoinType.ERC20,
      value: COIN_TOKEN_TYPE.ERC20,
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

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinMiniDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];
  chainInfo = this.environmentService.chainInfo;
  image_s3 = this.environmentService.imageUrl;
  defaultLogoAura = this.image_s3 + 'images/icons/aura.svg';

  constructor(
    private accountService: AccountService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private nameTagService: NameTagService,
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.getListToken();
  }

  getListToken() {
    const { accountAddress, accountEvmAddress } = transferAddress(
      this.chainInfo.bech32Config.bech32PrefixAccAddr,
      this.address,
    );
    const payload = {
      account_address: accountAddress?.toLowerCase(),
      evm_address: accountEvmAddress?.toLowerCase(),
      keyword: this.textSearch,
    };

    if (this.dataTable?.length > 0) {
      let searchList;
      // Filter type token
      if (this.tokenFilter !== '') {
        searchList = this.dataTable?.filter((item) => item.type?.toLowerCase() === this.tokenFilter);
      }

      // Search with text search
      let txtSearch = this.textSearch.trim();
      const addressNameTag = this.nameTagService.findAddressByNameTag(this.textSearch);
      if (addressNameTag?.length > 0) {
        txtSearch = addressNameTag;
      }

      if (this.textSearch && searchList) {
        searchList = searchList?.filter(
          (item) =>
            item.name?.toLowerCase().includes(txtSearch.toLowerCase()) ||
            item.contract_address == txtSearch.toLowerCase(),
        );
      } else if (this.tokenFilter === '') {
        searchList = this.dataTable?.filter(
          (item) =>
            item.name?.toLowerCase().includes(txtSearch.toLowerCase()) ||
            item.contract_address == txtSearch.toLowerCase(),
        );
      }

      // Mapping token Url to navigare token detail page for Ibc and Native
      searchList.map((token) => ({
        ...token,
        tokenUrl:
          (token?.type !== COIN_TOKEN_TYPE.CW20
            ? token.denom?.replace('ibc/', '') // Ibc and native link
            : token.contract_address) || '',
      }));

      this.dataSource.data = [...searchList];
    } else {
      this.accountService.getAssetCW20ByOwner(payload).subscribe({
        next: (res) => {
          let data: any;
          if (res?.data?.length > 0) {
            let lstToken = _.get(res, 'data').map((element) => {
              data = element;
              if (data) {
                data.change = data.priceChangePercentage24h;
                data.isValueUp = true;
                data['balance'] = data['balance'] || 0;
                data.value = data.value;
                if (data.change !== '-' && data.change < 0) {
                  data.isValueUp = false;
                  data.change = Number(data.change.toString().substring(1));
                }
              }
              return data;
            });

            lstToken = lstToken
              ?.filter((k) => k?.symbol)
              // Mapping token Url to navigare token detail page for Ibc and Native
              .map((token) => ({
                ...token,
                tokenUrl:
                  (token?.type !== COIN_TOKEN_TYPE.CW20
                    ? token.denom?.replace('ibc/', '') // Ibc and native link
                    : token.contract_address) || '',
              }));
            // store datatable
            this.dataTable = lstToken;
            // Sort and slice 20 frist record.
            this.dataSource = new MatTableDataSource<any>(lstToken);
            this.pageData.length = res.meta?.count || lstToken?.length;
            this.listTokenType.forEach((e) => {
              if (e.value === '') {
                e.quantity = this.pageData?.length || 0;
              } else {
                e.quantity = this.dataTable?.filter((ite) => ite.type.toLowerCase() === e.value)?.length || 0;
              }
            });
          } else {
            this.pageData.length = 0;
            this.dataSource.data = [];
          }

          this.totalAssets.emit(this.pageData?.length || 0);
          this.totalValue.emit(res?.totalValue);
          this.setTokenFilter(this.listTokenType[0]);
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            if (e.error?.error?.statusCode) {
              this.errTxt = e.error?.error?.statusCode + ' ' + e.error?.error?.message;
            } else {
              this.errTxt = e.error?.message || e.message;
            }
          }
          this.assetsLoading = false;
        },
        complete: () => {
          this.assetsLoading = false;
        },
      });
    }
  }

  setTokenFilter(token) {
    this.tokenFilterItem = token;
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
}
