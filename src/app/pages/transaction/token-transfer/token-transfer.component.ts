import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { NULL_ADDRESS, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-token-transfer',
  templateUrl: './token-transfer.component.html',
  styleUrls: ['./token-transfer.component.scss'],
})
export class TokenTransferComponent implements OnInit, OnDestroy {
  @Input() transaction: any;
  @Input() transferType: string = 'nft';
  @Output() transferDataLength: EventEmitter<{ transferType: 'nft' | 'token'; length: number }> = new EventEmitter<{
    transferType: 'nft' | 'token';
    length: number;
  }>();
  nullAddress = NULL_ADDRESS;
  dataSourceFTs = new MatTableDataSource<any>([]);
  dataSourceNFTs = new MatTableDataSource<any>([]);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: 1,
  };
  templatesFTs: Array<TableTemplate> = [
    { matColumnDef: 'assets', headerCellDef: 'assets' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
  ];

  templatesNFTs: Array<TableTemplate> = [
    { matColumnDef: 'nft', headerCellDef: 'nft' },
    { matColumnDef: 'transfer', headerCellDef: 'transfer' },
    { matColumnDef: 'action', headerCellDef: 'action' },
  ];
  displayedColumnsFTs: string[] = this.templatesFTs.map((dta) => dta.matColumnDef);
  displayedColumnsNFTs: string[] = this.templatesNFTs.map((dta) => dta.matColumnDef);
  maxLengthSymbol = 20;
  ellipsisStringLength = 8;
  smartContractList = [];

  coinInfo = this.environmentService.chainInfo.currencies[0];
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  destroy$ = new Subject<void>();

  constructor(
    private environmentService: EnvironmentService,
    private router: Router,
    private transactionService: TransactionService,
    private layout: BreakpointObserver,
    private commonService: CommonService,
    private contractService: ContractService,
    private ibcService: IBCService,
  ) {
    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state?.matches) {
        this.maxLengthSymbol = 10;
        this.ellipsisStringLength = 6;
      } else {
        this.maxLengthSymbol = 20;
        this.ellipsisStringLength = 8;
      }
    });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    if (this.transaction['status'] == 'Fail') {
      return;
    }
    if (this.transaction['evm_hash']) {
      this.getEVMTokenTransfer();
    } else {
      this.getTokenTransfer();
    }
  }

  getTokenTransfer() {
    let coinTransfer = [];
    this.transactionService
      .getListTransferFromTx(this.transaction['tx_hash'], this.transaction['height'])
      .subscribe((res) => {
        res.coin_transfer?.forEach((event) => {
          event.event_attributes.forEach((element, index) => {
            //get first data with UnDelegate && Delegate
            if (
              this.transaction['typeOrigin'] === TRANSACTION_TYPE_ENUM.Undelegate ||
              this.transaction['typeOrigin'] === TRANSACTION_TYPE_ENUM.Delegate
            ) {
              if (event.event_attributes?.length < 8 || index >= 3) {
                return;
              }
            }

            if (element.composite_key === 'coin_received.receiver') {
              let indexData;
              // check index of receiver
              if (index % 2 !== 0) {
                indexData = index - 1;
              } else {
                indexData = index + 1;
              }
              const arrAmount = event.event_attributes[indexData]?.value?.split(',');
              arrAmount.forEach((amountTemp) => {
                let cw20_contract = {};
                let dataAmount = {};
                cw20_contract['symbol'] = cw20_contract['symbol'] || this.coinInfo.coinDenom;
                cw20_contract['name'] = cw20_contract['name'] || this.coinInfo.coinDenom;
                let decimal = cw20_contract['decimal'] || this.coinInfo.coinDecimals;
                let from = event.event_attributes[index - 2]?.value;
                if (event.event_attributes[index - 2]?.composite_key === 'coin_received.receiver') {
                  from = event.event_attributes[0]?.value;
                }
                let to = event.event_attributes[index]?.value;
                if (amountTemp.indexOf('ibc') >= 0) {
                  dataAmount = this.commonService.mappingNameIBC(amountTemp);
                  cw20_contract['name'] = dataAmount['name'];
                  cw20_contract['symbol'] = dataAmount['display'];
                  cw20_contract['ibc_denom'] = dataAmount['denom'] || dataAmount['symbol'];
                  decimal = dataAmount['decimals'];
                  from = event.event_attributes?.find((k) => k.composite_key === 'coin_spent.spender')?.value;
                  for (let idx = 0; idx < event.event_attributes; idx++) {
                    if (idx >= index && event.event_attributes[idx].composite_key === 'coin_spent.receiver') {
                      to = event.event_attributes[idx]?.value;
                    }
                  }
                }
                let amount = +amountTemp.match(/\d+/g)[0];
                coinTransfer.push({ amount, cw20_contract, from, to, decimal });
              });
            }
          });
        });

        if (res?.cw721_activity?.length > 0) {
          // remove record approve && revoke
          const arrCW721 = res.cw721_activity?.filter((k) => k.action !== 'approve' && k.action !== 'revoke');
          this.dataSourceNFTs.data = arrCW721;
          this.transferDataLength.emit({ transferType: 'nft', length: arrCW721?.length });
        } else {
          this.transferDataLength.emit({ transferType: 'nft', length: 0 });
        }
        if (res.cw20_activity?.length > 0 || coinTransfer?.length > 0) {
          this.dataSourceFTs.data = [...coinTransfer, ...(res.cw20_activity || [])];
          this.transferDataLength.emit({ transferType: 'token', length: this.dataSourceFTs?.data?.length });

          res.cw20_activity.forEach((element) => {
            element.decimal = element.decimal || element.cw20_contract?.decimal || 6;
          });
        } else {
          this.transferDataLength.emit({ transferType: 'token', length: 0 });
        }
      });
  }

  getEVMTokenTransfer() {
    let coinTransfer = [];
    this.transactionService
      .getListEVMTransferFromTx(this.transaction['evm_hash'], this.transaction['height'])
      .pipe(
        switchMap((res) => {
          let listAddr = [];
          (res.erc721_activity || []).forEach((element) => {
            if (element.from) {
              listAddr.push(element.from);
            }
            if (element.to) {
              listAddr.push(element.to);
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
      .subscribe((res) => {
        if (res?.erc721_activity?.length > 0) {
          const arrCW721 = res.erc721_activity;
          this.dataSourceNFTs.data = arrCW721;
          this.transferDataLength.emit({ transferType: 'nft', length: arrCW721?.length });
        } else {
          this.transferDataLength.emit({ transferType: 'nft', length: 0 });
        }
        if (res.erc20_activity?.length > 0 || coinTransfer?.length > 0) {
          this.dataSourceFTs.data = [...coinTransfer, ...(res.erc20_activity || [])];
          this.transferDataLength.emit({ transferType: 'token', length: this.dataSourceFTs?.data?.length });

          res.erc20_activity.forEach((element) => {
            element.decimal = element.decimal || element.erc20_contract?.decimal || 6;
          });
        } else {
          this.transferDataLength.emit({ transferType: 'token', length: 0 });
        }
      });
  }

  navigateToNFTDetail(address: string, tokenId: number): void {
    let enCode = this.encodeData(tokenId);
    this.router.navigate([`/token/${address}/${enCode}`]);
  }

  encodeData(data) {
    return encodeURIComponent(data);
  }

  isEvmSmartContract(addr) {
    return this.smartContractList.filter((i) => i === addr).length > 0;
  }
}
