import { Component, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { Globals, convertDataTransactionSimple } from '../../../app/global/global';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'LABEL.TX_HASH' },
    { matColumnDef: 'type', headerCellDef: 'LABEL.TYPE' },
    { matColumnDef: 'status', headerCellDef: 'RESULT' },
    { matColumnDef: 'fee', headerCellDef: 'LABEL.FEE' },
    { matColumnDef: 'height', headerCellDef: 'COMMON.HEIGHT' },
    { matColumnDef: 'timestamp', headerCellDef: 'COMMON.TIME' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];

  pageSize = 20;
  typeTransaction = TYPE_TRANSACTION;
  loading = true;
  errText = null;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    private transactionService: TransactionService,
    public global: Globals,
    public commonService: CommonService,
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
        this.loading = false;
        this.errText = e.status + ' ' + e.statusText;
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
