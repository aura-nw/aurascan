import { Component } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';

@Component({
  selector: 'app-evm-transactions',
  templateUrl: './evm-transactions.component.html',
  styleUrls: ['./evm-transactions.component.scss'],
})
export class EvmTransactionsComponent {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'evm_hash', headerCellDef: 'EVM Txn hash', headerWidth: 214 },
    { matColumnDef: 'method', headerCellDef: 'Method', headerWidth: 216 },
    { matColumnDef: 'height', headerCellDef: 'Height', headerWidth: 110 },
    { matColumnDef: 'timestamp', headerCellDef: 'Time', headerWidth: 136 },
    { matColumnDef: 'from', headerCellDef: 'From', headerWidth: 214 },
    { matColumnDef: 'to', headerCellDef: 'To', headerWidth: 214 },
    { matColumnDef: 'amount', headerCellDef: 'Amount', headerWidth: 176 },
    { matColumnDef: 'hash', headerCellDef: 'AURA Txn', headerWidth: 102 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];
  currencies = this.env.chainInfo.currencies[0];
  maxPageSize = 20;
  loading = true;
  errTxt = null;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private layout: BreakpointObserver,
    private transactionService: TransactionService,
    private env: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getListTx();
  }

  getListTx(): void {
    const payload = {
      limit: this.maxPageSize,
    };

    this.transactionService.queryEvmTransactionList(payload).subscribe({
      next: (res) => {
        if (res?.transaction?.length > 0) {
          const txs = res.transaction;
          txs.forEach((element) => {
            element.evm_hash = _.get(element, 'evm_transaction.hash');
            element.type = _.get(element, 'transaction_messages[0].type')?.split('.').pop();
            element.from = _.get(element, 'transaction_messages[0].sender');
            element.to = _.get(element, 'evm_transaction.to');
            element.amount = _.get(element, 'transaction_messages[0].content.data.value');
          });
          this.dataSource.data = [...txs];
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
}
