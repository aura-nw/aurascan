import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, timer } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { TYPE_TRANSACTION } from '../../../app/core/constants/transaction.constant';
import { TRANSACTION_TYPE_ENUM } from '../../../app/core/constants/transaction.enum';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { CHART_RANGE, PAGE_EVENT } from '../../core/constants/common.constant';
import { balanceOf } from '../../core/utils/common/parsing';
import { Globals } from '../../global/global';
import { ChartOptions, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chartRange = CHART_RANGE.D_30;
  chartRangeData = CHART_RANGE;

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
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any>;
  dataTx: any[];

  typeTransaction = TYPE_TRANSACTION;
  timerUnSub: Subscription;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public commonService: CommonService,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
    private numberPipe: DecimalPipe,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.getInfoData();
    const halftime = 60000;
    this.timerUnSub = timer(halftime, halftime).subscribe(() => this.getInfoData());
  }

  //get all data for dashboard
  getInfoData() {
    this.getListBlock();
    this.getListTransaction();
    setTimeout(() => {
      this.updateBlockAndTxs(this.chartRange);
    }, 1000);
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
    this.blockService.blocksLastest(this.PAGE_SIZE).subscribe((res) => {
      if (res?.data?.length > 0) {
        this.dataSourceBlock = new MatTableDataSource(res.data);
        this.dataBlock = res.data;
      }
    });
  }

  getListTransaction(): void {
    this.transactionService.txs(this.PAGE_SIZE, 0).subscribe((res) => {
      if (res?.data?.length > 0) {
        res.data.forEach((trans) => {
          trans.typeOrigin = trans.type;
          const typeTrans = this.typeTransaction.find((f) => f.label.toLowerCase() === trans.type.toLowerCase());
          trans.type = typeTrans?.value;
        });
        this.dataSourceTx = new MatTableDataSource(res.data);
        this.dataTx = res.data;
      }
    });
  }

  updateBlockAndTxs(type: string): void {
    this.chartRange = type;
    this.blockService.getBlockAndTxs(type).subscribe((res) => {
      //update data common
      this.getInfoCommon();
      const data1 = res.data.map((i) => i.total);
      let categories = res.data.map((i) => String(i.timestamp).replace('Z', ''));

      this.chartOptions.series = [
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
        axisBorder: {
          show: true,
          color: '#FFA741',
        },
      };
    });
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.global, res.data);
    });
  }

  checkAmountValue(message: any[], txHash: string, type: string) {
    let eTransType = TRANSACTION_TYPE_ENUM;
    if (message?.length > 1) {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    } else if (message?.length === 0 || (message?.length === 1 && !message[0]?.amount)) {
      return '-';
    } else {
      let amount = message[0]?.amount[0]?.amount;
      //check type is Delegate/Undelegate/Redelegate
      if (type === eTransType.Delegate || type === eTransType.Undelegate || type === eTransType.Redelegate) {
        amount = message[0]?.amount?.amount;
      }
      return (
        this.numberPipe.transform(balanceOf(amount), this.global.formatNumberToken) +
        `<span class=text--primary> ${this.denom} </span>`
      );
    }
  }
}
