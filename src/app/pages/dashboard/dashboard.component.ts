import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexXAxis,
  ApexTooltip,
  ChartType,
  ApexStroke
} from 'ng-apexcharts';
import { CommonService } from '../../../app/core/services/common.service';
import { TableTemplate } from '../../../app/core/models/common.model';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../app/core/services/auth.service';
import { BlockService } from '../../../app/core/services/block.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import {Globals} from "../../global/global";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  block_height;
  total_txs_num;
  total_validator_num;
  breadCrumbItems!: Array<{}>;
  title!: string;
  chart = '30d';
  chart1 = '30d';
  chart2 = '30d';

  walletOverview!: ChartType | any;
  investedOverview!: ChartType | any;
  marketOverview!: ChartType | any;
  walletlineChart!: ChartType | any;
  tradeslineChart!: ChartType | any;
  investedlineChart!: ChartType | any;
  profitlineChart!: ChartType | any;
  recentActivity: any;
  News: any;
  transactionsAll: any;
  transactionsBuy: any;
  transactionsSell: any;
  pageSize = 5;

  public chartTxs: any;
  public chartBlock: any;
  public chartOptions: Partial<ChartOptions>;

  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);
  dataSourceBlock: MatTableDataSource<any>;

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash_format', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' }
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any>;
  currentUser;
  typeTransaction = TYPE_TRANSACTION;

  constructor(
    private commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router,
    private authenticationService: AuthenticationService,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals
  ) {
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      // { label: 'Dashboard' },
      // { label: 'Dashboard', active: true }
    ];
    this.chartOptions = {
      series: [
        {
          name: "blocks",
          type: "area",
          data: []
        },
        {
          name: "transactions",
          type: "line",
          data: []
        }
      ],
      chart: {
        height: 300,
        type: "area"
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 3,
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: []
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };
    this.getInfo();
    this.getListBlock();
    this.getListTransaction();

    setTimeout(() => {
      this.updateBlockAndTxs(this.chart);
    }, 1000);

    setInterval(() => {
      this.getInfo();
      this.getListBlock();
      this.getListTransaction();
      this.updateBlockAndTxs(this.chart);
      // this.getBlockPer(this.chart1);
      // this.getTxsPer(this.chart2);
    }, 60000);
  }

  getListBlock(): void {
    this.blockService
      .blocks(this.pageSize, 0)
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
      .txs(this.pageSize, 0)
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

  getInfo(): void {
    this.commonService
      .status()
      .subscribe(res => {
        this.block_height = res.data.block_height;
        this.total_txs_num = res.data.total_txs_num;
        this.total_validator_num = res.data.total_validator_num;
      }
      );
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
    this.chart = type;
    this.blockService.getBlockAndTxs(type)
      .subscribe(res => {
        const data0 = res[0].data.map(i => i.count);
        const data1 = res[1].data.map(i => i.count);
        let categories = res[0].data.map(i => i.timestamp);
        let missing1 = data0.filter(item => this.chartOptions.series[0].data.indexOf(item) < 0);
        let missing2 = data1.filter(item => this.chartOptions.series[1].data.indexOf(item) < 0);
        // this.chartOptions.xaxis = {
        //   type: "datetime",
        //   categories: []
        // }
        // if (missing1?.length > 0 || missing2?.length > 0) {
        this.chartOptions.series = [
          {
            name: "blocks",
            type: "area",
            data: data0
          },
          {
            name: "transactions",
            type: "line",
            data: data1
          }
        ];

        this.chartOptions.xaxis = {
          type: "datetime",
          categories: categories
        }
        // }
      });
  }

  getBlockPer(type: string): void {
    this.chart1 = type;
    this.blockService
      .getBlocksPer(type)
      .subscribe(res => {
        const data = res.data.map(i => i.count);
        let categories = [];
        switch (type) {
          case '60m':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'm'));
            break;
          case '24h':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'h'));
            break;
          case '30d':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'd'));
            break;
          case '12M':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'M'));
            break;
          default:
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'm'));
            break;
        }
        this.chartBlock = {
          series: [
            {
              name: 'count',
              data: data
            }
          ],
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'straight'
          },
          title: {
            text: 'Block per' + type,
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5
            }
          },
          xaxis: {
            categories: categories
          }
        };
      }
      );
  }

  getTxsPer(type): void {
    this.chart2 = type;
    this.transactionService
      .getTxsPer(type)
      .subscribe(res => {
        const data = res.data.map(i => i.count);
        let categories = [];
        switch (type) {
          case '60m':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'm'));
            break;
          case '24h':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'h'));
            break;
          case '30d':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'd'));
            break;
          case '12M':
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'M'));
            break;
          default:
            categories = res.data.map(i => this.datePipe.transform(i.timestamp, 'm'));
            break;
        }
        this.chartTxs = {
          series: [
            {
              name: 'count',
              data: data
            }
          ],
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'straight'
          },
          title: {
            text: 'Txs per' + type,
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5
            }
          },
          xaxis: {
            categories: categories
          }
        };
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
