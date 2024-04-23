import {Component, Input, OnInit} from '@angular/core';
import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {MatLegacyTableDataSource as MatTableDataSource} from '@angular/material/legacy-table';
import {ActivatedRoute} from '@angular/router';
import {SigningCosmWasmClient} from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {of, switchMap} from 'rxjs';
import {PAGE_EVENT, TIMEOUT_ERROR} from 'src/app/core/constants/common.constant';
import {ContractRegisterType} from 'src/app/core/constants/contract.enum';
import {EModeToken} from 'src/app/core/constants/token.enum';
import {EnvironmentService} from 'src/app/core/data-services/environment.service';
import {TableTemplate} from 'src/app/core/models/common.model';
import {CommonService} from 'src/app/core/services/common.service';
import {NameTagService} from 'src/app/core/services/name-tag.service';
import {TokenService} from 'src/app/core/services/token.service';

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
    {matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5},
    {matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 30},
    {matColumnDef: 'balance', headerCellDef: 'amount', headerWidth: 12},
    {matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 12},
    {matColumnDef: 'value', headerCellDef: 'value', headerWidth: 12},
  ];

  CW721Templates: Array<TableTemplate> = [
    {matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5},
    {matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 40},
    {matColumnDef: 'quantity', headerCellDef: 'amount', headerWidth: 12},
    {matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 15},
  ];

  template: Array<TableTemplate> = [];
  displayedColumns: string[];
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 50,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  loading = true;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  contractType = ContractRegisterType;
  numberTopHolder = 100;
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
    private nameTagService: NameTagService,
  ) {
  }

  ngOnInit(): void {
    this.linkAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getListData();

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  ngOnDestroy(): void {
    this.tokenService.filterBalanceNative$.next(null);
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
          if (this.totalHolder > this.numberTopHolder) {
            this.pageData.length = this.numberTopHolder;
          } else {
            this.pageData.length = this.totalHolder;
          }

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
    } catch (error) {
    }
  }

  getDenomHolder() {
    let payload = {
      denomHash: this.tokenDetail?.denomHash || this.tokenDetail?.denom,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      address: this.keyWord || null,
      isExcludedAddresses: this.tokenDetail.modeToken === this.EModeToken.Native,
    };

    const addressNameTag = this.nameTagService.findAddressByNameTag(this.keyWord);
    if (addressNameTag?.length > 0) {
      payload['address'] = addressNameTag;
    }

    // get list holder for Native Token
    if (this.tokenDetail.modeToken === this.EModeToken.Native) {
      this.getDenomNative(payload);
      return;
    }

    // get list holder for IBC Token
    this.tokenService
      .getDenomHolder(payload)
      .pipe(
        switchMap((element) => {
          const tokenSupplyOrigin = BigNumber(this.tokenDetail?.totalSupply).multipliedBy(
            BigNumber(10).pow(this.tokenDetail.decimal),
          );
          this.totalHolder = element?.account_balance_aggregate?.aggregate?.count;
          let accountBalance = element['account_balance'];
          accountBalance?.forEach((item) => {
            item.balance = item.amount;
            item.owner = item.account?.address;
            item.percent_hold = BigNumber(item.amount).dividedBy(tokenSupplyOrigin).multipliedBy(100);
            item.value =
              BigNumber(item.amount)
                .multipliedBy(this.tokenDetail?.price || 0)
                .dividedBy(BigNumber(10).pow(this.decimalValue))
                .toFixed() || 0;
          });
          return of(accountBalance);
        }),
      )
      .subscribe({
        next: (res) => {
          if (this.totalHolder > this.numberTopHolder) {
            this.pageData.length = this.numberTopHolder;
          } else {
            this.pageData.length = this.totalHolder;
          }
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

  getDenomNative(payload) {
    this.tokenService
      .getNativeHolder(payload)
      .pipe(
        switchMap((element) => {
          if (element['m_view_account_balance_statistic']?.length === 0) {
            return of([]);
          }
          const tokenSupplyOrigin = BigNumber(this.tokenDetail?.totalSupply).multipliedBy(
            BigNumber(10).pow(this.tokenDetail.decimal),
          );
          this.totalHolder = element['m_view_account_balance_statistic_aggregate']?.aggregate?.count;
          let accountBalance = element['m_view_account_balance_statistic'];
          this.updateTime = accountBalance[0]?.updated_at;
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

          if (payload.address && accountBalance?.length === 1) {
            this.tokenService.filterBalanceNative$.next(accountBalance[0].balance);
          }
          return of(accountBalance);
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
