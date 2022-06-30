import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DATEFORMAT } from '../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { getAmount, Globals } from '../../../../app/global/global';
@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  id: string | number;
  blockId: string | number;
  item = undefined;

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
  dataTxs: any[];
  length = 0;
  typeTransaction = TYPE_TRANSACTION;
  dateFormat;
  loading = true;
  isRawData = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    private datePipe: DatePipe,
    public global: Globals,
    public commonService: CommonService,
    private transactionService: TransactionService,
    private layout: BreakpointObserver,
  ) {}

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

  getDetailById() {
    this.blockService.blockDetailById(this.blockId).subscribe(
      (res) => {
        this.loading = true;
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }
        res.data?.txs.forEach((trans) => {
          trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });
        this.item = res.data;
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.dataTxs = res.data?.txs;
        this.length = res.data?.txs.length;
        this.loading = false;
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  getDetailByHeight() {
    this.blockService.blockDetail(this.id).subscribe(
      (res: ResponseDto) => {
        this.loading = true;
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }

        res.data?.txs.forEach((trans) => {
          trans.amount = getAmount(trans.messages, trans.type, trans.raw_log);
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.status = StatusTransaction.Fail;
          if (trans.code === CodeTransaction.Success) {
            trans.status = StatusTransaction.Success;
          }
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });
        this.item = res.data;
        this.dateFormat = this.datePipe.transform(this.item?.timestamp, DATEFORMAT.DATETIME_UTC);
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.dataTxs = res.data?.txs;
        this.length = res.data?.txs.length;
        this.loading = false;
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  checkAmountValue(amount: number, txHash: string) {
    if (amount === 0) {
      return '-';
    } else {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    }
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }
}
