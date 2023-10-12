import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute, Router } from '@angular/router';
import { Buffer } from 'buffer';
import { sha256 } from 'js-sha256';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PAGE_EVENT } from '../../../../app/core/constants/common.constant';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { Globals, convertDataBlock, convertDataTransaction } from '../../../../app/global/global';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  blockHeight: string | number;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  blockDetail = undefined;
  TAB = [
    {
      id: 0,
      value: 'SUMMARY',
    },
    {
      id: 1,
      value: 'JSON',
    },
  ];

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTxs: any[];
  loading = true;
  loadingTxs = true;
  isRawData = false;
  isCurrentMobile;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((data) => {
      this.isCurrentMobile = data.matches;

      if (this.isCurrentMobile) {
        this.pageData.pageSize = 5;
      } else {
        this.pageData.pageSize = 20;
      }
    }),
  );

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    public global: Globals,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.blockHeight = this.route.snapshot.paramMap.get('height');
    if (this.blockHeight === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
  }

  getDetail(): void {
    if (this.blockHeight) {
      this.getDetailByHeight();
    }
  }

  getDetailByHeight() {
    let payload = {
      limit: 1,
      height: this.blockHeight,
    };
    this.blockService.getDataBlock(payload).subscribe(
      async (res) => {
        if (res?.block?.length > 0) {
          const block = convertDataBlock(res)[0];
          block['round'] = _.get(res.block[0], 'data.block.last_commit.round');
          block['chainid'] = _.get(res.block[0], 'data.block.header.chain_id');
          block['json_data'] = _.get(res.block[0], 'data.block');
          block['gas_used'] = block['gas_wanted'] = 0;
          block['events'] = _.get(res.block[0], 'data.block_result.begin_block_events');
          const blockEnd = _.get(res.block[0], 'data.block_result.end_block_events');
          if (blockEnd) {
            block['events'] = block['events'].concat(blockEnd);
          }
          this.blockDetail = block;

          //get list tx detail
          let txs = [];
          for (const key in res.block[0]?.data?.block?.data?.txs) {
            const element = res.block[0]?.data?.block?.data?.txs[key];
            const tx = sha256(Buffer.from(element, 'base64')).toUpperCase();

            const payload = {
              limit: 1,
              hash: tx,
            };
            this.transactionService.getListTx(payload).subscribe((res) => {
              if (res?.transaction[0]) {
                txs.push(res?.transaction[0]);
              }
            });
          }

          await Promise.all(txs);
          setTimeout(() => {
            if (txs?.length > 0) {
              let dataTempTx = {};
              dataTempTx['transaction'] = txs;
              if (txs.length > 0) {
                txs = convertDataTransaction(dataTempTx, this.coinInfo);
                txs.forEach((k) => {
                  this.blockDetail['gas_used'] += +k.gas_used;
                  this.blockDetail['gas_wanted'] += +k.gas_wanted;
                });
                this.dataSource.data = txs;
              }
            }
            this.loadingTxs = false;
          }, 1000);
        } else {
          setTimeout(() => {
            this.getDetailByHeight();
          }, 10000);
        }
      },
      () => {},
      () => {
        this.loading = false;
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

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    if (this.pageData) {
      const { pageIndex, pageSize } = this.pageData;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      this.dataTxs = this.dataSource.data.slice(start, end);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
