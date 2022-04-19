import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DATEFORMAT, PAGE_SIZE_OPTIONS } from '../../../../app/core/constants/common.constant';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { CodeTransaction, StatusTransaction } from '../../../../app/core/constants/transaction.enum';
import { ResponseDto, TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { getAmount, Globals } from '../../../../app/global/global';
@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  id;
  blockId;
  item;
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
  length;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  typeTransaction = TYPE_TRANSACTION;
  statusTransaction = StatusTransaction;
  dateFormat;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    private datePipe: DatePipe,
    public global: Globals,
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
    if (linkHash) {
      this.router.navigate(['transaction', data.tx_hash]);
    } else if (linkBlock) {
      this.router.navigate(['blocks', data.height]);
    }
  }

  getDetailById() {
    this.blockService.blockDetailById(this.blockId).subscribe(
      (res) => {
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
        this.length = res.data?.txs.length;
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }

  getDetailByHeight() {
    this.blockService.blockDetail(this.id).subscribe(
      (res: ResponseDto) => {
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
        this.length = res.data?.txs.length;
      },
      (error) => {
        this.router.navigate(['/']);
      },
    );
  }
}
