import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockService } from '../../../../app/core/services/block.service';
import { TransactionService } from '../../../../app/core/services/transaction.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { ValidatorService } from '../../../../app/core/services/validator.service';
import { TYPE_TRANSACTION } from 'src/app/core/constants/transaction.constant';

@Component({
  selector: 'app-validators-detail',
  templateUrl: './validators-detail.component.html',
  styleUrls: ['./validators-detail.component.scss']
})
export class ValidatorsDetailComponent implements OnInit {
  id;
  item;
  breadCrumbItems = [
    { label: 'Validators' },
    { label: 'List', active: false },
    { label: 'Detail', active: true }
  ];

  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'validation_code', headerCellDef: 'Result' },
    { matColumnDef: 'abc', headerCellDef: 'Amount' },
    { matColumnDef: 'cde', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  length;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];

  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'block_hash_format', headerCellDef: 'Block Hash' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any>;

  dataSourceBlock: MatTableDataSource<any>;
  typeTransaction = TYPE_TRANSACTION;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private validatorService: ValidatorService,
    private blockService: BlockService,
    private transactionService: TransactionService) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
    this.getListBlock();
    this.getListTransaction();
  }

  getDetail(): void {
    this.validatorService
      .validatorsDetail(this.id)
      .subscribe(res => {
        if (res.status === 404) {
          this.router.navigate(['/']);
          return;
        }

        this.item = res.data;
        this.dataSource = new MatTableDataSource(res.data?.txs);
        this.length = res.data?.txs?.length;
        this.dataSource.sort = this.sort;
      },
        error => {
          this.router.navigate(['/']);
        }
      )
  }

  getListBlock(): void {
    this.blockService
      .blocks(5, 0)
      .subscribe(res => {
        res.data.forEach((block) => {
          block.block_hash_format = block.block_hash.replace(block.block_hash.substring(6, block.block_hash.length - 6), '...');
        });
        this.dataSourceBlock = new MatTableDataSource(res.data);
      }
      );
  }

  getListTransaction(): void {
    this.transactionService
      .txs(5, 0)
      .subscribe(res => {
        res.data.forEach((trans) => {
          const typeTrans = this.typeTransaction.find(f => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });
        this.dataSourceTx = new MatTableDataSource(res.data);
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
