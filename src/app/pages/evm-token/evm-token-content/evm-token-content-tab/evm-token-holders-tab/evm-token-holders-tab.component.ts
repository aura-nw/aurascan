import { Component, Input, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import BigNumber from 'bignumber.js';
import { map, switchMap } from 'rxjs';
import { PAGE_EVENT, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EvmContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeEvmToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ContractService } from '../../../../../core/services/contract.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-evm-token-holders-tab',
  templateUrl: './evm-token-holders-tab.component.html',
  styleUrls: ['./evm-token-holders-tab.component.scss'],
})
export class EvmTokenHoldersTabComponent implements OnInit {
  @Input() keyWord = '';
  @Input() contractAddress: string;
  @Input() typeContract: string;
  @Input() tokenDetail: any;
  @Input() decimalValue: number;

  ERC20Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5 },
    { matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 30 },
    { matColumnDef: 'balance', headerCellDef: 'amount', headerWidth: 12 },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 12 },
    { matColumnDef: 'value', headerCellDef: 'value', headerWidth: 12 },
  ];

  ERC721Templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'rank', headerWidth: 5 },
    { matColumnDef: 'owner', headerCellDef: 'address', headerWidth: 40 },
    { matColumnDef: 'quantity', headerCellDef: 'amount', headerWidth: 12 },
    { matColumnDef: 'percent_hold', headerCellDef: 'percentage', headerWidth: 15 },
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
  contractType = EvmContractRegisterType;
  numberTopHolder = 100;
  totalQuantity = 0;
  numberTop = 0;
  totalHolder = 0;
  errTxt: string;
  EModeToken = EModeEvmToken;
  linkAddress: string;
  countTotal = 0;

  chainInfo = this.environmentService.chainInfo;

  smartContractList: string[] = [];

  constructor(
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.linkAddress = this.route.snapshot.paramMap.get('contractAddress');
    this.getListData();

    this.template = this.getTemplate();
    this.displayedColumns = this.getTemplate().map((template) => template.matColumnDef);
  }

  getListData() {
    if (this.typeContract === EvmContractRegisterType.ERC721) {
      this.getQuantity();
    } else {
      this.getDenomHolder();
    }
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getTemplate(): Array<TableTemplate> {
    let result = this.ERC20Templates;
    if (this.typeContract && this.typeContract !== EvmContractRegisterType.ERC20) {
      result = this.ERC721Templates;
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

  getDenomHolder() {
    const payload = {
      denomHash: this.contractAddress,
      limit: this.pageData.pageSize,
      offset: this.pageData.pageIndex * this.pageData.pageSize,
      address: this.keyWord || null,
      isExcludedAddresses: false,
    };

    this.tokenService
      .getDenomHolder(payload)
      .pipe(
        map((element) => {
          if (element?.account_balance?.length === 0) {
            return [];
          }

          this.totalHolder = element?.account_balance_aggregate?.aggregate?.count;
          let accountBalance = element['account_balance'];
          if (this.tokenDetail.modeToken === this.EModeToken.ERCToken) {
            accountBalance?.forEach((item) => {
              item.balance = item.amount > 0 ? item.amount : 0;
              item.owner = item.account?.evm_address;
              item.percent_hold =
                +this.tokenDetail?.total_supply > 0
                  ? BigNumber(item.balance)
                      .dividedBy(BigNumber(this.tokenDetail?.total_supply))
                      .multipliedBy(100)
                  : 0;
              item.value =
                BigNumber(item.balance)
                  .multipliedBy(this.tokenDetail?.price || 0)
                  .dividedBy(BigNumber(10).pow(this.decimalValue))
                  .toFixed() || 0;
            });
            return accountBalance;
          }

          return [];
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

  getTotalSupply() {
    if (this.tokenDetail.num_tokens) return;
    this.tokenService.countTotalTokenERC721(this.contractAddress).subscribe((res) => {
      this.tokenDetail.num_tokens = res.erc721_token_aggregate?.aggregate?.count || 0;
    });
  }

  async getQuantity() {
    let queryData = {
      num_tokens: {},
    };
    try {
      this.getTotalSupply();
      this.getHolderNFT();
    } catch (error) {}
  }

  getHolderNFT() {
    const payload = {
      limit: this.pageData.pageSize,
      offset: this.pageData.pageSize * this.pageData.pageIndex,
      contractAddress: this.contractAddress,
    };
    this.tokenService
      .getListTokenHolderErc721(payload)
      .pipe(
        switchMap((res) => {
          let listAddr = [];
          res?.view_count_holder_erc721.forEach((element) => {
            if (element.owner) {
              listAddr.push(element.from);
            }
          });
          const listAddrUnique = _.uniq(listAddr);
          return this.contractService.findEvmContractList(listAddrUnique).pipe(
            map((r) => {
              this.smartContractList = _.uniq((r?.evm_smart_contract || []).map((i) => i?.address));
              return res;
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          if (res?.view_count_holder_erc721?.length > 0) {
            this.totalHolder = res.view_count_holder_erc721_aggregate?.aggregate?.count;
            if (this.totalHolder > this.numberTopHolder) {
              this.pageData.length = this.numberTopHolder;
            } else {
              this.pageData.length = this.totalHolder;
            }

            res?.view_count_holder_erc721.forEach((element) => {
              element['quantity'] = element.count;
            });

            let topHolder = Math.max(...res?.view_count_holder_erc721.map((o) => o.quantity)) || 1;
            this.numberTop = topHolder > this.numberTop ? topHolder : this.numberTop;
            res?.view_count_holder_erc721.forEach((element) => {
              element['value'] = 0;
            });

            if (this.tokenDetail.num_tokens) {
              res?.view_count_holder_erc721.forEach((k) => {
                k['percent_hold'] = (k.quantity / this.tokenDetail.num_tokens) * 100;
                k['width_chart'] = (k.quantity / this.numberTop) * 100;
              });
            }
            this.dataSource = new MatTableDataSource<any>(res.view_count_holder_erc721);
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

  isEvmSmartContract(addr) {
    return this.smartContractList.filter((i) => i === addr).length > 0;
  }
}

