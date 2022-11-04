import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { convertDataBlock, convertDataTransaction, Globals } from '../../global/global';
import { ChartOptions, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';
import { createChart } from 'lightweight-charts';
import ExcelExport from 'export-xlsx';

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

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'type', headerCellDef: 'Type' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];

  typeTransaction = TYPE_TRANSACTION;
  timerUnSub: Subscription;

  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  coinInfo = this.environmentService.configValue.chain_info.currencies[0];

  chart = null;
  areaSeries = null;
  chartData;
  chartDataExp = [];

  toolTipWidth = 80;
  toolTipHeight = 80;
  toolTipMargin = 15;

  SETTINGS_FOR_EXPORT = {
    // Table settings
    fileName: 'Transactions',
    workSheets: [
      {
        sheetName: 'Transactions',
        startingRowNumber: 2,
        gapBetweenTwoTables: 2,
        tableSettings: {
          table1: {
            tableTitle: 'Transactions value by date',
            headerDefinition: [
              {
                name: 'Date',
                key: 'date',
              },
              {
                name: 'Transactions',
                key: 'transactions',
              },
            ],
          },
        },
      },
    ],
  };

  constructor(
    public commonService: CommonService,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
    private numberPipe: DecimalPipe,
    private environmentService: EnvironmentService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.getInfoData();
    const halftime = 60000;
    this.timerUnSub = timer(halftime, halftime).subscribe(() => this.getInfoData());
    // somewhere in your code
    this.chart = createChart(document.getElementById('chart'), {
      height: 400,
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
      layout: {
        backgroundColor: '#24262e',
        textColor: '#868a97',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      leftPriceScale: {
        visible: true,
      },
      rightPriceScale: {
        visible: false,
      },
    });
    this.areaSeries = this.chart.addAreaSeries();
    this.areaSeries.applyOptions({
      lineColor: '#5EE6D0',
      topColor: 'rgba(136,198,203,0.12)',
      bottomColor: 'rgba(119, 182, 188, 0.01)',
    });
    this.initTooltip();
  }

  drawChart(data, dateTime) {
    this.chartData = null;
    this.chartDataExp = [];
    let arr = [];
    data.forEach((element, index) => {
      var temp = { value: element, time: dateTime[index] };
      arr.push(temp);
    });
    this.chartData = arr;

    // setup data for export
    arr.forEach((data) => {
      const dateF = this.datepipe.transform(data.time, 'dd-MM-yyyy');
      this.chartDataExp.push({
        date: dateF,
        transactions: +data.value,
      });
    });
    this.chartDataExp = [
      {
        table1: this.chartDataExp,
      },
    ];
    this.areaSeries.setData(arr);
    this.chart.timeScale().fitContent();
  }

  //get all data for dashboard
  getInfoData() {
    this.getListBlock();
    this.getListTransaction();
    setTimeout(() => {
      this.updateBlockAndTxs(this.chartRange);
    }, 1000);
    this.cdr.detectChanges();
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
    this.blockService.blocksIndexer(this.PAGE_SIZE).subscribe((res) => {
      const { code, data } = res;
      if (code === 200) {
        const blocks = convertDataBlock(data);
        this.dataSourceBlock = new MatTableDataSource(blocks);
      }
    });
  }

  getListTransaction(): void {
    this.transactionService.txsIndexer(this.PAGE_SIZE, 0).subscribe((res) => {
      this.dataSourceTx.data = [];
      const { code, data } = res;
      if (code === 200) {
        const txs = convertDataTransaction(data, this.coinInfo);

        if (this.dataSourceTx.data.length > 0) {
          this.dataSourceTx.data = [...this.dataSourceTx.data, ...txs];
        } else {
          this.dataSourceTx.data = [...txs];
        }
        this.dataTx = txs;
      }
    });
  }

  updateBlockAndTxs(type: string): void {
    this.chartRange = type;
    this.blockService.getBlockAndTxs(type).subscribe((res) => {
      //update data common
      this.getInfoCommon();
      const data1 = res.data.map((i) => i.total);
      let categories = res.data.map((i) => i.timestamp);

      this.drawChart(data1, categories);
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

  chartDataExport() {
    const excelExport = new ExcelExport();
    excelExport.downloadExcel(this.SETTINGS_FOR_EXPORT, this.chartDataExp);
  }

  businessDayToString(businessDay) {
    return businessDay.year + '-' + businessDay.month + '-' + businessDay.day;
  }

  initTooltip() {
    const container = document.getElementById('chart');
    const toolTip = document.createElement('div');
    toolTip.className = 'floating-tooltip-2';
    container.appendChild(toolTip);

    // update tooltip
    this.chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        const dateStr = this.businessDayToString(param.time);
        toolTip.style.display = 'block';
        var price = param.seriesPrices.get(this.areaSeries);
        toolTip.innerHTML =
          '' +
          '<div class="floating-tooltip__header">Transactions</div>' +
          '<div class="floating-tooltip__body"><div style="font-size: 14px; margin: 4px 0;">' +
          Math.round(100 * price) / 100 +
          '</div><div>' +
          dateStr +
          '' +
          '</div></div>';
        var coordinate = this.areaSeries.priceToCoordinate(price);
        var shiftedCoordinate = param.point.x - 50;
        if (coordinate === null) {
          return;
        }
        shiftedCoordinate = Math.max(0, Math.min(container.clientWidth - this.toolTipWidth, shiftedCoordinate));
        var coordinateY =
          coordinate - this.toolTipHeight - this.toolTipMargin > 0
            ? coordinate - this.toolTipHeight - this.toolTipMargin
            : Math.max(
                0,
                Math.min(
                  container.clientHeight - this.toolTipHeight - this.toolTipMargin,
                  coordinate + this.toolTipMargin,
                ),
              );
        toolTip.style.left = shiftedCoordinate + 'px';
        toolTip.style.top = coordinateY + 'px';
      }
    });
  }
}
