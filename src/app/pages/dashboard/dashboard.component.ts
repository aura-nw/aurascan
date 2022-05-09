import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { PAGE_EVENT } from '../../core/constants/common.constant';
import { Globals } from '../../global/global';
import { ChartOptions, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  block_height: number;
  total_txs_num: number;
  total_validator_num: number;

  chartRange = '30d';

  PAGE_SIZE = PAGE_EVENT.PAGE_SIZE;

  public chartOptions: Partial<ChartOptions> = DASHBOARD_CHART_OPTIONS;

  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);
  dataSourceBlock: MatTableDataSource<any>;
  dataBlock: any[];

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any>;
  dataTx: any[];

  typeTransaction = TYPE_TRANSACTION;
  timerUnSub: Subscription;

  constructor(
    public commonService: CommonService,
    private router: Router,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
  ) {}

  ngOnInit(): void {
    this.getInfo();
    this.getListBlock();
    this.getListTransaction();

    setTimeout(() => {
      this.updateBlockAndTxs(this.chartRange);
    }, 1000);

    const halftime = 60000;
    this.timerUnSub = timer(halftime, halftime).subscribe(() => this.getInfoData());
  }

  //get all data for dashboard
  getInfoData() {
    this.getInfo();
    this.getListBlock();
    this.getListTransaction();
    this.updateBlockAndTxs(this.chartRange);
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    if (this.timerUnSub) {
      this.timerUnSub.unsubscribe();
    }
  }

  getListBlock(): void {
    this.blockService.blocks(this.PAGE_SIZE, 0).subscribe((res) => {
      if (res?.data?.length > 0) {
        res.data.forEach((block) => {
          block.block_hash_format = block.block_hash.replace(
            block.block_hash.substring(6, block.block_hash.length - 6),
            '...',
          );
        });
        this.dataSourceBlock = new MatTableDataSource(res.data);
        this.dataBlock = res.data;
      }
    });
  }

  getListTransaction(): void {
    this.transactionService.txs(this.PAGE_SIZE, 0).subscribe((res) => {
      if (res?.data?.length > 0) {
        res.data.forEach((trans) => {
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
          trans.tx_hash_format = trans.tx_hash.replace(trans.tx_hash.substring(6, trans.tx_hash.length - 6), '...');
        });
        this.dataSourceTx = new MatTableDataSource(res.data);
        this.dataTx = res.data;
      }
    });
  }

  getInfo(): void {
    this.commonService.status().subscribe((res) => {
      if (res?.data) {
        this.block_height = res.data.block_height;
        this.total_txs_num = res.data.total_txs_num;
        this.total_validator_num = res.data.total_validator_num;
      }
    });
  }
  // getBlockAndTxs(type: string): void {
  //   this.chart = type;
  //   this.commonService.getBlockAndTxs(type)
  //     .subscribe(res => {
  //       const data0 = res[0].data.map(i => i.count);
  //       const data1 = res[1].data.map(i => i.count);
  //       let categories = res[0].data.map(i => i.timestamp);
  //     });
  // }

  updateBlockAndTxs(type: string): void {
    this.chartRange = type;
    this.blockService.getBlockAndTxs(type).subscribe((res) => {
        // const data0 = res[0].data.map((i) => i.count);
        const data1 = res.data.map((i) => i.count);
        let categories = res.data.map((i) => i.timestamp);
        // let missing1 = data0.filter((item) => this.chartOptions.series[0].data.indexOf(item) < 0);
        // let missing2 = data1.filter((item) => this.chartOptions.series[1].data.indexOf(item) < 0);
        // this.chartOptions.xaxis = {
        //   type: "datetime",
        //   categories: []
        // }
        // if (missing1?.length > 0 || missing2?.length > 0) {
        this.chartOptions.series = [
          // {
          //   name: 'blocks',
          //   type: 'area',
          //   data: data0,
          // },
          {
            name: 'transactions',
            type: 'line',
            data: data1,
            color: '#5EE6D0',
          },
        ];

        this.chartOptions.xAxis = {
          type: 'datetime',
          categories: categories,
          labels: {
            datetimeUTC: false,
          },
        };
        // }
    });
  }

  // getBlockPer(type: string): void {
  //   this.blockService.getBlocksPer(type).subscribe((res) => {
  //     const data = res.data.map((i) => i.count);
  //     let categories = [];
  //     switch (type) {
  //       case '60m':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'm'));
  //         break;
  //       case '24h':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'h'));
  //         break;
  //       case '30d':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'd'));
  //         break;
  //       case '12M':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'M'));
  //         break;
  //       default:
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'm'));
  //         break;
  //     }
  //     // this.chartBlock = {
  //     //   series: [
  //     //     {
  //     //       name: 'count',
  //     //       data: data,
  //     //     },
  //     //   ],
  //     //   chart: {
  //     //     height: 350,
  //     //     type: 'line',
  //     //     zoom: {
  //     //       enabled: false,
  //     //     },
  //     //   },
  //     //   dataLabels: {
  //     //     enabled: false,
  //     //   },
  //     //   stroke: {
  //     //     curve: 'straight',
  //     //   },
  //     //   title: {
  //     //     text: 'Block per' + type,
  //     //     align: 'left',
  //     //   },
  //     //   grid: {
  //     //     row: {
  //     //       colors: ['#f3f3f3', 'transparent'],
  //     //       opacity: 0.5,
  //     //     },
  //     //   },
  //     //   xaxis: {
  //     //     categories: categories,
  //     //     labels: {
  //     //       datetimeUTC: false,
  //     //     },
  //     //   },
  //     // };
  //   });
  // }

  // getTxsPer(type): void {
  //   this.transactionService.getTxsPer(type).subscribe((res) => {
  //     // const data = res.data.map((i) => i.count);
  //     let categories = [];
  //     switch (type) {
  //       case '60m':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'm'));
  //         break;
  //       case '24h':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'h'));
  //         break;
  //       case '30d':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'd'));
  //         break;
  //       case '12M':
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'M'));
  //         break;
  //       default:
  //         categories = res.data.map((i) => this.datePipe.transform(i.timestamp, 'm'));
  //         break;
  //     }
  //     // this.chartTxs = {
  //     //   series: [
  //     //     {
  //     //       name: 'count',
  //     //       data: data,
  //     //     },
  //     //   ],
  //     //   chart: {
  //     //     height: 350,
  //     //     type: 'line',
  //     //     zoom: {
  //     //       enabled: false,
  //     //     },
  //     //   },
  //     //   dataLabels: {
  //     //     enabled: false,
  //     //   },
  //     //   stroke: {
  //     //     curve: 'straight',
  //     //   },
  //     //   title: {
  //     //     text: 'Txs per' + type,
  //     //     align: 'left',
  //     //   },
  //     //   grid: {
  //     //     row: {
  //     //       colors: ['#f3f3f3', 'transparent'],
  //     //       opacity: 0.5,
  //     //     },
  //     //   },
  //     //   xaxis: {
  //     //     categories: categories,
  //     //     labels: {
  //     //       datetimeUTC: false,
  //     //     },
  //     //   },
  //     // };
  //   });
  // }

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
