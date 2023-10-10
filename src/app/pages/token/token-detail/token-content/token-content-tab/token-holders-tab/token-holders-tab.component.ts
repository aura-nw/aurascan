import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TableTemplate } from '../../../../../../core/models/common.model';
import { Globals } from '../../../../../../global/global';
import * as _ from 'lodash';
import { CommonService } from 'src/app/core/services/common.service';

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
    { matColumnDef: 'balance', headerCellDef: 'amount', headerWidth: 12},
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
  tokenType = ContractRegisterType.CW20;
  contractType = ContractRegisterType;
  numberTopHolder = 100;
  totalQuantity = 0;
  numberTop = 0;
  totalHolder = 0;

  chainInfo = this.environmentService.configValue.chain_info;

  constructor(
    public global: Globals,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
  ) {}

  ngOnInit(): void {
    if (this.typeContract !== ContractRegisterType.CW20) {
      this.getQuantity();
    } else {
      this.getHolder();
    }
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  getHolder() {
    this.tokenService.getListTokenHolder(this.numberTopHolder, 0, this.contractAddress).subscribe(
      (res) => {
        const data = _.get(res, `cw20_holder`);
        const count = _.get(res, `cw20_holder_aggregate`);
        if (data?.length > 0) {
          this.totalHolder = count.aggregate?.count;
          if (this.totalHolder > this.numberTopHolder) {
            this.pageData.length = this.numberTopHolder;
          } else {
            this.pageData.length = this.totalHolder;
          }

          const dataFlat = data?.map((item) => {
            return {
              owner: item.address,
              balance: item.amount,
              percent_hold: (item.amount / item.cw20_contract.total_supply) * 100,
              value: 0,
            };
          });
          this.dataSource = new MatTableDataSource<any>(dataFlat);
        }
      },
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  getHolderNFT() {
    const payload = {
      limit: this.numberTopHolder,
      contractAddress: this.contractAddress,
    };
    this.tokenService.getListTokenHolderNFT(payload).subscribe(
      (res) => {
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
      () => {},
      () => {
        this.loading = false;
      },
    );
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    return this.typeContract !== ContractRegisterType.CW20 ? this.CW721Templates : this.CW20Templates;
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
}
