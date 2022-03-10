import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../app/core/constants/transaction.enum';
import { NUMBER_CONVERT } from 'src/app/core/constants/common.constant';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  // bread crumb items
  breadCrumbItems!: Array<{}>;
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
  length;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private transactionService: TransactionService
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Transaction' },
      { label: 'List', active: true }
    ];
    this.getList();
  }
  changePage(page: PageEvent): void {
    this.dataSource = null;
    this.pageIndex = page.pageIndex;
    this.getList();
  }

  getList(): void {
    this.transactionService
      .txs(this.pageSize, this.pageIndex)
      .subscribe((res: ResponseDto) => {
        res.data.forEach((trans) => {
          const typeTrans = this.typeTransaction.find(f => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
          trans.amount = 0;
          //check exit amount of transaction
          if (trans.messages && trans.messages[0]?.amount) {
            let amount =  trans.messages[0]?.amount[0]?.amount / NUMBER_CONVERT;
            trans.amount = trans.messages?.length === 1 ? amount : 'More';
          }
        });

        this.dataSource = new MatTableDataSource(res.data);
        this.length = res.meta.count;
        this.dataSource.sort = this.sort;
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
