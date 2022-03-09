import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DATEFORMAT } from 'src/app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit {
  id;
  blockId;
  item;
  breadCrumbItems = [
    { label: 'Blocks' },
    { label: 'List', active: false },
    { label: 'Detail', active: true }
  ];

  @ViewChild(MatSort) sort: MatSort;
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
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  dateFormat;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('height');
    this.blockId = this.route.snapshot.paramMap.get('blockId');
    this.getDetail();
  }

  getDetail(): void {
    if (this.id) {
      this.getDetailByHeight();
    } else if (this.blockId) {
      this.getDetailById();
    }
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

  getDetailById() {
    this.blockService
      .blockDetailById(this.blockId)
      .subscribe(res => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }
        res.data?.txs.forEach((trans) => {
          const typeTrans = this.typeTransaction.find(f => f.label === trans.type);
          trans.type = typeTrans?.value;
          trans.status = trans.code === CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });
        this.item = res.data;
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.length = res.data?.txs.length;
        this.dataSource.sort = this.sort;
      },
        error => {
          this.router.navigate(['/']);
        }
      );
  }

  getDetailByHeight() {
    this.blockService
      .blockDetail(this.id)
      .subscribe((res: ResponseDto) => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }

        res.data?.txs.forEach((trans) => {
          const typeTrans = this.typeTransaction.find(f => f.label === trans.type);
          trans.type = typeTrans?.value;
          trans.status = trans.code === CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
          trans.amount = 0;
          //check exit amount of transaction
          if (trans.messages && trans.messages[0]?.amount) {
            trans.amount = trans.messages?.length === 1 ? trans.messages[0]?.amount[0]?.amount : 'More';
          }
        });
        this.item = res.data;
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.length = res.data?.txs.length;
        this.dataSource.sort = this.sort;
      },
        error => {
          this.router.navigate(['/']);
        }
      );
  }
}
