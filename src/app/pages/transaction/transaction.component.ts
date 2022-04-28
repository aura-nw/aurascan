import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonService } from '../../../app/core/services/common.service';
import { PAGE_EVENT, PAGE_SIZE_OPTIONS } from '../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { getAmount, Globals } from '../../../app/global/global';
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;

  length: number;
  pageSize = PAGE_EVENT.PAGE_SIZE;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  loading = true;

  constructor(
    private router: Router,
    private transactionService: TransactionService,
    public global: Globals,
    public commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getList();
  }
  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.transactionService
      .txs(this.pageSize, this.pageIndex * this.pageSize)
      .subscribe((res: ResponseDto) => {
        this.loading = true;
        res.data.forEach((trans) => {
          //get amount of transaction
          trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
          const typeTrans = this.typeTransaction.find(f => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });

        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.loading = false;
      }
      );
  }

  openTxsDetail(event: any, data: any) {
    const linkHash = event?.target.classList.contains('hash-link');
    const linkBlock = event?.target.classList.contains('block-link');
    if (linkHash) {
      this.router.navigate(['transaction', data.tx_hash]);
    } else if (linkBlock) {
      this.router.navigate(['blocks/id', data.blockId]);
    }
  }
}
