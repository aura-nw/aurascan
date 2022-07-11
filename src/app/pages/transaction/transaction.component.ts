import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PAGE_SIZE_OPTIONS } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { getAmount, Globals } from '../../../app/global/global';
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataTx: any[];

  length: number;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  loading = true;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    public global: Globals,
    public commonService: CommonService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getList();
  }
  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.transactionService.txs(this.pageSize, this.pageIndex * this.pageSize).subscribe((res: ResponseDto) => {
      this.loading = true;
      if (res?.data?.length > 0) {
        res.data.forEach((trans) => {
          //get amount of transaction
          trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });

        this.dataSource = new MatTableDataSource(res.data);
        this.dataTx = res.data;
        this.length = res?.meta?.count;
      }
      this.loading = false;
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
