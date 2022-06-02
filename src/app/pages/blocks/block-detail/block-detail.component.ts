import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../app/core/services/common.service';
import { DATEFORMAT, PAGE_SIZE_OPTIONS } from '../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { getAmount, Globals } from '../../../../app/global/global';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  id: string | number;
  blockId: string | number;
  item = undefined;
  breadCrumbItems = [{ label: 'Blocks' }, { label: 'List', active: false }, { label: 'Detail', active: true }];

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
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
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

  openTxsDetail(event: any, data: any) {
    const linkHash = event?.target.classList.contains('hash-link');
    const linkBlock = event?.target.classList.contains('block-link');
    let url = '';
    if (linkHash) {
      //this.router.navigate(['transaction', data.tx_hash]);
      url = this.router.serializeUrl(this.router.createUrlTree(['transaction', data.tx_hash]));
      window.open(url);
    } else if (linkBlock) {
      //this.router.navigate(['blocks', data.height]);
      url = this.router.serializeUrl(this.router.createUrlTree(['blocks', data.height]));
      window.open(url);
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
