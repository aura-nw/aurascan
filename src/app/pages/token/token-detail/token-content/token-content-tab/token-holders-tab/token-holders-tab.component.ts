import { Component, Input, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
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
  @Input() tokenDetail: any;

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
    { matColumnDef: 'quantity', headerCellDef: 'amount' },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage' },
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
  numberTopHolder = 100;
  totalQuantity = 0;
  numberTop = 0;
  totalHolder = 0;
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(
    public global: Globals,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    if (this.isNFTContract) {
      this.tokenType = ContractRegisterType.CW721;
      this.getQuantity();
    } else {
      this.getListTokenHolder(this.tokenType);
    }
    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  getListTokenHolder(tokenType: string) {
    this.loading = true;
    this.tokenService.getListTokenHolder(this.numberTopHolder, 0, tokenType, this.contractAddress).subscribe((res) => {
      if (res && res.data?.resultAsset?.length > 0) {
        this.totalHolder = res.data?.resultCount;
        if (this.totalHolder > this.numberTopHolder) {
          this.pageData.length = this.numberTopHolder;
        } else {
          this.pageData.length = this.totalHolder;
        }

        let topHolder = Math.max(...res.data?.resultAsset.map((o) => o.quantity)) || 1;
        this.numberTop = topHolder > this.numberTop ? topHolder : this.numberTop;
        res.data?.resultAsset.forEach((element) => {
          element['value'] = 0;
        });

        if (this.totalQuantity) {
          res.data?.resultAsset.forEach((k) => {
            k['percent_hold'] = (k.quantity / this.totalQuantity) * 100;
            k['width_chart'] = (k.quantity / this.numberTop) * 100;
          });
        }
        this.dataSource = new MatTableDataSource<any>(res.data?.resultAsset);
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
  }

  async getQuantity() {
    let queryData = {
      num_tokens: {},
    };
    const client = await SigningCosmWasmClient.connect(this.chainInfo.rpc);
    try {
      const config = await client.queryContractSmart(this.contractAddress, queryData);
      this.totalQuantity = config?.count || 0;
      this.getListTokenHolder(this.tokenType);
    } catch (error) {}
  }
}
