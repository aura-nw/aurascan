import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as _ from 'lodash';
import { map, switchMap } from 'rxjs';
import { EMethodContract, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { mappingMethodName } from 'src/app/global/global';
import { ContractService } from '../../core/services/contract.service';

@Component({
  selector: 'app-evm-transactions',
  templateUrl: './evm-transactions.component.html',
  styleUrls: ['./evm-transactions.component.scss'],
})
export class EvmTransactionsComponent {
  dataTx: any[];
  denom = this.env.chainInfo.currencies[0].coinDenom;
  decimal = this.env.evmDecimal; // EVM decimal
  maxPageSize = 20;
  loading = true;
  errTxt = null;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  templates: Array<TableTemplate> = [
    { matColumnDef: 'evm_hash', headerCellDef: 'EVM Txn hash', headerWidth: 214 },
    { matColumnDef: 'method', headerCellDef: 'Method', headerWidth: 216 },
    { matColumnDef: 'height', headerCellDef: 'Height', headerWidth: 110 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 136 },
    { matColumnDef: 'from', headerCellDef: 'From', headerWidth: 200 },
    { matColumnDef: 'arrow', headerCellDef: ' ', headerWidth: 28 },
    { matColumnDef: 'to', headerCellDef: 'To', headerWidth: 214 },
    { matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 136 },
    { matColumnDef: 'hash', headerCellDef: this.denom ? `Cosmos Txn` : 'Txn', headerWidth: 108 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private layout: BreakpointObserver,
    private transactionService: TransactionService,
    private env: EnvironmentService,
    private contractService: ContractService,
  ) {}

  ngOnInit(): void {
    this.getListTx();
  }

  getListTx(): void {
    const payload = {
      limit: this.maxPageSize,
    };
    let listAddr = [];
    this.transactionService
      .queryEvmTransactionList(payload)
      .pipe(
        switchMap((res) => {
          const listTemp = res?.transaction
            ?.filter((j) => j.evm_transaction.data?.length > 0)
            ?.map((k) => k.evm_transaction.data?.substring(0, 8));
          const listMethodId = _.uniq(listTemp);

          return this.transactionService.getListMappingName(listMethodId).pipe(
            map((element) => {
              if (res?.transaction?.length > 0) {
                return res.transaction.map((tx) => {
                  const methodId = _.get(tx, 'evm_transaction.data')?.substring(0, 8);
                  const from = _.get(tx, 'evm_transaction.from');
                  const to = _.get(tx, 'evm_transaction.to');
                  listAddr.push(from);
                  listAddr.push(to);
                  return {
                    ...tx,
                    evm_hash: _.get(tx, 'evm_transaction.hash'),
                    type: mappingMethodName(element, methodId),
                    from: from,
                    to: to,
                    amount: _.get(tx, 'evm_transaction.value'),
                  };
                });
              }
              return [];
            }),
          );
        }),
      )
      .pipe(
        switchMap((res) => {
          const listAddrUnique = _.uniq(listAddr).filter((i) => !!i);
          return this.contractService.findEvmContractList(listAddrUnique).pipe(
            map((r) => {
              const smartContractList = _.uniq((r?.evm_smart_contract || []).map((i) => i?.address));
              const trans = res.map((i: any) => {

                const toIsEvmContract = smartContractList.filter((s) => s === i.to)?.length > 0;
                
                let type = i?.type;
                if (i?.to && !toIsEvmContract) type = 'Send';
                
                return { 
                  ...i,
                  type,  
                  toIsEvmContract,
                  fromIsEvmContract: smartContractList.filter((s) => s === i.from).length > 0,
                }
              });
              return trans;
            }),
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.dataSource.data = res;
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
