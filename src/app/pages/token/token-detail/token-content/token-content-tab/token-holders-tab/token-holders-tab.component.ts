import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { ActivatedRoute } from '@angular/router';
import { balanceOf } from 'src/app/core/utils/common/parsing';

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
    { matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 30 },
    { matColumnDef: 'quantity', headerCellDef: 'amount', headerWidth: 12 },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 15 },
  ];

  template: Array<TableTemplate> = [];
  displayedColumns: string[];
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
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

  chainInfo = this.environmentService.chainInfo;

  constructor(
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.linkAddress = this.route.snapshot.paramMap.get('contractAddress');
    if (this.typeContract) {
      if (this.typeContract !== ContractRegisterType.CW20) {
        this.getQuantity();
      } else {
        this.getHolder();
      }
    } else {
      this.getDenomHolder();
    }

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  getHolder() {
    this.tokenService.getListTokenHolder(this.numberTopHolder, 0, this.contractAddress).subscribe({
      next: (res) => {
        const data = _.get(res, `cw20_holder`);
        const count = _.get(res, `cw20_holder_aggregate`);
        if (data?.length > 0) {
          this.totalHolder = count.aggregate?.count;
          if (this.totalHolder > this.numberTopHolder) {
            this.pageData.length = this.numberTopHolder;
          } else {
            this.pageData.length = this.totalHolder;
          }
          let dataFlat = data?.map((item) => {
            return {
              owner: item.address,
              balance: item.amount,
              percent_hold: (item.amount / item.cw20_contract.total_supply) * 100,
              value:
                new BigNumber(item.amount)
                  .multipliedBy(this.tokenDetail.price)
                  .dividedBy(BigNumber(10).pow(this.decimalValue))
                  .toFixed() || 0,
            };
          });
          this.dataSource.data = [...dataFlat];
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
      limit: this.numberTopHolder,
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
    this.tokenService.getDenomHolder(this.tokenDetail?.denomHash, this.keyWord || null).subscribe({
      next: (res) => {
        this.totalHolder = this.keyWord?.length > 0 ? res?.account?.length : this.tokenDetail?.holder;
        if (this.totalHolder > this.numberTopHolder) {
          this.pageData.length = this.numberTopHolder;
        } else {
          this.pageData.length = this.totalHolder;
        }

        let dataFlat = res.account?.map((item) => {
          let amount = item.balances?.find((k) => k.denom === this.tokenDetail?.denomHash)?.amount;

          return {
            owner: item.address,
            amount,
            balance: amount,
            percent_hold: new BigNumber(amount).dividedBy(this.tokenDetail?.totalSupply).multipliedBy(100),
            value:
              new BigNumber(amount)
                .multipliedBy(this.tokenDetail?.price)
                .dividedBy(BigNumber(10).pow(this.decimalValue))
                .toFixed() || 0,
          };
        });
        this.dataSource.data = [...dataFlat];
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
}
