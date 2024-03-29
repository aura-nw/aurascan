import { Component, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { TableTemplate } from '../../../app/core/models/common.model';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { convertDataTransactionSimple } from '../../../app/global/global';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];

  pageSize = 20;
  typeTransaction = TYPE_TRANSACTION;
  loading = true;
  errTxt = null;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    private transactionService: TransactionService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getListTx();
  }

  getListTx(): void {
    const payload = {
      limit: this.pageSize,
    };
    this.transactionService.getListTx(payload).subscribe({
      next: (res) => {
        if (res?.transaction?.length > 0) {
          const txs = convertDataTransactionSimple(res, this.coinInfo);
          if (this.dataSource.data.length > 0) {
            this.dataSource.data = [...this.dataSource.data, ...txs];
          } else {
            this.dataSource.data = [...txs];
          }
          this.dataTx = txs;
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

  checkAmountValue(amount: number, txHash: string) {
    if (amount === 0) {
      return '-';
    } else {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    }
  }
}
