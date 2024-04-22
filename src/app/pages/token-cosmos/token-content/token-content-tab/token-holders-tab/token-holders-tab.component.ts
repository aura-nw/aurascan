import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { map, of, switchMap } from 'rxjs';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-token-holders-tab',
  templateUrl: './token-holders-tab.component.html',
  styleUrls: ['./token-holders-tab.component.scss'],
})
export class TokenHoldersTabComponent implements OnInit {
  @Input() keyWord = '';
  @Input() contractAddress: string;
  @Input() typeContract: string;
  @Input() tokenDetail: any;
  @Input() decimalValue: number;

  CW20Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5 },
    { matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 30 },
    { matColumnDef: 'balance', headerCellDef: 'amount', headerWidth: 12 },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 12 },
    { matColumnDef: 'value', headerCellDef: 'value', headerWidth: 12 },
  ];

  CW721Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5 },
    { matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 40 },
    { matColumnDef: 'quantity', headerCellDef: 'amount', headerWidth: 12 },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 15 },
  ];

  template: Array<TableTemplate> = [];
  displayedColumns: string[];
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 5,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  loading = true;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  contractType = ContractRegisterType;
  totalQuantity = 0;
  numberTop = 0;
  totalHolder = 0;
  errTxt: string;
  EModeToken = EModeToken;
  linkAddress: string;
  countTotal = 0;
  updateTime;

  chainInfo = this.environmentService.chainInfo;

  constructor(
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.tokenDetail?.modeToken === this.EModeToken.Native) {
      this.pageData.pageSize = 50;
    }

    this.linkAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getListData();

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  getListData() {
    if (this.typeContract) {
      if (this.typeContract !== ContractRegisterType.CW20) {
        this.getQuantity();
      } else {
        this.getHolder();
      }
    } else {
      this.getDenomHolder();
    }
  }

  getHolder() {
    this.tokenService
      .getListTokenHolder(
        this.pageData.pageSize,
        this.pageData.pageSize * this.pageData.pageIndex,
        this.contractAddress,
      )
      .subscribe({
        next: (res) => {
          const data = _.get(res, `cw20_holder`);
          const count = _.get(res, `cw20_holder_aggregate`);
          if (data?.length > 0) {
            this.totalHolder = count.aggregate?.count;
            this.pageData.length = this.totalHolder;
            let dataFlat = data?.map((item) => {
              return {
                owner: item.address,
                balance: item.amount,
                percent_hold: BigNumber(item.amount)
                  .dividedBy(BigNumber(item.cw20_contract.total_supply))
                  .multipliedBy(100),
                value:
                  new BigNumber(item.amount)
                    .multipliedBy(this.tokenDetail?.price)
                    .dividedBy(BigNumber(10).pow(this.decimalValue))
                    .toFixed() || 0,
              };
            });
            this.dataSource = new MatTableDataSource<any>(dataFlat);
          }
        },
        error: (e) => {
          if (e.name === TIMEOUT_ERROR) {
            this.errTxt = e.message;
          } else {
            this.errTxt = e.status + ' ' + e.statusText;
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  getHolderNFT() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      contractAddress: this.contractAddress,
    };
    this.tokenService.getListTokenHolderNFT(payload).subscribe({
      next: (res) => {
        if (res?.view_count_holder_cw721?.length > 0) {
          this.totalHolder = res.view_count_holder_cw721_aggregate?.aggregate?.count;
          this.pageData.length = this.totalHolder;
          res?.view_count_holder_cw721.forEach((element) => {
            element['quantity'] = element.count;
          });

          let topHolder = Math.max(...res?.view_count_holder_cw721.map((o) => o.quantity)) || 1;
          this.numberTop = topHolder > this.numberTop ? topHolder : this.numberTop;
          res?.view_count_holder_cw721.forEach((element) => {
            element['value'] = 0;
          });

          if (this.totalQuantity) {
            res?.view_count_holder_cw721.forEach((k) => {
              k['percent_hold'] = (k.quantity / this.totalQuantity) * 100;
              k['width_chart'] = (k.quantity / this.numberTop) * 100;
            });
          }
          this.dataSource = new MatTableDataSource<any>(res.view_count_holder_cw721);
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    let result = this.CW20Templates;
    if (this.typeContract && this.typeContract !== ContractRegisterType.CW20) {
      result = this.CW721Templates;
    }
    return result;
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListData();
  }

  async getQuantity() {
    let queryData = {
      num_tokens: {},
    };
    const client = await SigningCosmWasmClient.connect(this.chainInfo.rpc);
    try {
      const config = await client.queryContractSmart(this.contractAddress, queryData);
      this.totalQuantity = config?.count || 0;
      this.getHolderNFT();
    } catch (error) {}
  }

  getDenomHolder() {
    const payload = {
      denomHash: this.tokenDetail?.denomHash || this.tokenDetail?.denom,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      address: this.keyWord || null,
      isExcludedAddresses: this.tokenDetail.modeToken === this.EModeToken.Native,
    };
    const tokenSupplyOrigin = BigNumber(this.tokenDetail?.totalSupply).multipliedBy(
      BigNumber(10).pow(this.tokenDetail.decimal),
    );
    this.tokenService
      .getTokenHolder(payload)
      .pipe(
        switchMap((element) => {
          if (element?.m_view_account_balance_statistic?.length === 0) {
            return of([]);
          }
          this.totalHolder = element?.account_balance_aggregate?.aggregate?.count;
          let accountBalance = element['m_view_account_balance_statistic'];
          this.updateTime = accountBalance[0].updated_at;
          if (this.tokenDetail.modeToken === this.EModeToken.IBCCoin) {
            accountBalance?.forEach((item) => {
              item.balance = item.amount;
              item.owner = item.address;
              item.percent_hold = BigNumber(item.amount).dividedBy(tokenSupplyOrigin).multipliedBy(100);
              item.value =
                BigNumber(item.amount)
                  .multipliedBy(this.tokenDetail?.price || 0)
                  .dividedBy(BigNumber(10).pow(this.decimalValue))
                  .toFixed() || 0;
            });
            return of(accountBalance);
          }
          const addressList = accountBalance?.map((k) => {
            return k.address;
          });
          return this.tokenService.getListAmountNative(addressList).pipe(
            map((res) => {
              accountBalance?.forEach((item) => {
                const element = res?.data?.find((k) => k.address === item?.address);
                item.amount = item.balance = _.get(element, 'amount');
                item.owner = element?.address;
                item.percent_hold = BigNumber(element.amount).dividedBy(tokenSupplyOrigin).multipliedBy(100);
                item.value =
                  BigNumber(item.amount)
                    .multipliedBy(this.tokenDetail?.price || 0)
                    .dividedBy(BigNumber(10).pow(this.decimalValue))
                    .toFixed() || 0;
              });
              if (accountBalance?.length == 1 && this.keyWord) {
                this.tokenService.filterBalanceNative$.next(accountBalance[0]?.balance);
              }
              // sort list data with amount desc
              const sortData = accountBalance?.sort((a, b) => this.compare(a.amount, b.amount, false));
              return sortData;
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.pageData.length = this.totalHolder;
          this.dataSource = new MatTableDataSource<any>(res);
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
