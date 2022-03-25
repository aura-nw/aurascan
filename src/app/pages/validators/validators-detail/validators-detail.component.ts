import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockService } from '../../../../app/core/services/block.service';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { CommonService } from '../../../../app/core/services/common.service';
import { ValidatorService } from '../../../../app/core/services/validator.service';
import { TYPE_TRANSACTION } from '../../../../app/core/constants/transaction.constant';
import { PageEvent } from '@angular/material/paginator';

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
  lengthBlock;
  lengthDelegator;
  lengthPower;
  pageSize = 5;
  pageIndexBlock = 0;
  pageIndexDelegator = 0;
  pageIndexPower = 0;

  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'block_hash_format', headerCellDef: 'Block Hash' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);
  dataSourceBlock: MatTableDataSource<any>;

  templatesDelegator: Array<TableTemplate> = [
    { matColumnDef: 'delegator_address_format', headerCellDef: 'Delegator Address' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' }
  ];
  displayedColumnsDelegator: string[] = this.templatesDelegator.map((dta) => dta.matColumnDef);
  dataSourceDelegator: MatTableDataSource<any>;

  templatesPower: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'tx_hash_format', headerCellDef: 'TxHash' },
    { matColumnDef: 'fee', headerCellDef: 'Amount' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsPower: string[] = this.templatesPower.map((dta) => dta.matColumnDef);
  dataSourcePower: MatTableDataSource<any>;

  typeTransaction = TYPE_TRANSACTION;
  arrayUpTime = new Array(100);
  isUptimeMiss = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private validatorService: ValidatorService,
    private blockService: BlockService,
    private commonService: CommonService
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getDetail();
    this.getListBlockWithOperator();
    this.getListUpTime();
    this.getListDelegators();
    this.getListPower();
    // this.getListPower();
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
        this.dataSource.sort = this.sort;
      },
        error => {
          this.router.navigate(['/']);
        }
      )
  }

  getListBlockWithOperator(): void {
    this.blockService
      .blockWithOperator(5, this.pageIndexBlock, this.id)
      .subscribe(res => {
        res.data.forEach((block) => {
          block.block_hash_format = block.block_hash.replace(block.block_hash.substring(6, block.block_hash.length - 6), '...');
        });
        this.lengthBlock = res.meta?.count;
        this.dataSourceBlock = new MatTableDataSource(res.data);
      }
      );
  }

  getListUpTime(): void {
    this.blockService
      .getLastBlock()
      .subscribe(res => {
        this.arrayUpTime = res.data;
      }
      );
  }

  getListDelegators(): void {
    this.commonService
      .delegators(5, this.pageIndexDelegator, this.id)
      .subscribe(res => {
        res.data.forEach((delegator) => {
          delegator.delegator_address_format = delegator.delegator_address.replace(delegator.delegator_address.substring(6, delegator.delegator_address.length - 6), '...');
        });
        this.lengthDelegator = res.meta?.count;
        this.dataSourceDelegator = new MatTableDataSource(res.data);
      }
      );
  }

  getListPower(): void {
    this.validatorService
      .validatorsDetailListPower(5, this.pageIndexDelegator, this.id)
      .subscribe(res => {
        res.data.forEach((power) => {
          power.tx_hash_format = power.tx_hash.replace(power.tx_hash.substring(6, power.tx_hash.length - 6), '...');
        });
        this.dataSourcePower = new MatTableDataSource(res.data);
        this.lengthPower = res.meta?.count;
      }
      );
  }

  changePage(page: PageEvent, type: string): void {
    this.dataSource = null;
    switch (type) {
      case 'block':
        this.pageIndexBlock = page.pageIndex;
        this.getListBlockWithOperator();
        break;
      case 'delegator':
        this.pageIndexDelegator = page.pageIndex;
        this.getListDelegators();
        break;
      case 'power':
        this.pageIndexPower = page.pageIndex;
        this.getListPower();
        break;
      default:
        break;
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
}
