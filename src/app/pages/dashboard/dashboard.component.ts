import { DatePipe, DecimalPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import ExcelExport from 'export-xlsx';
import { createChart } from 'lightweight-charts';
import * as moment from 'moment';
import { Subscription, timer } from 'rxjs';
import { VOTING_STATUS } from 'src/app/core/constants/proposal.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { TRANSACTION_TYPE_ENUM } from '../../../app/core/constants/transaction.enum';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import {CHART_RANGE, PAGE_EVENT, TOKEN_ID_GET_PRICE} from '../../core/constants/common.constant';
import { balanceOf } from '../../core/utils/common/parsing';
import { convertDataBlock, convertDataTransaction, Globals } from '../../global/global';
import { DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';
import {NgxToastrService} from "src/app/core/services/ngx-toastr.service";
import {TranslateService} from "@ngx-translate/core";
import {ChartOptions} from "src/app/core/models/chart.model";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  chartRange = CHART_RANGE.M_60;
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

  min = 0;
  max = 99999;

  currDate;
  SETTINGS_FOR_EXPORT;
  isPrice = true;

  curr_voting_Period;
  voting_Period_arr = [];

  staking_APR = 0;
  tokenIdGetPrice = TOKEN_ID_GET_PRICE;
  tokenInfo;
  constructor(
    public commonService: CommonService,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
    private numberPipe: DecimalPipe,
    private environmentService: EnvironmentService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private proposalService: ProposalService,
  ) {}

  ngOnInit(): void {
    this.getInfoData();
    const halftime = 60000;
    this.timerUnSub = timer(halftime, halftime).subscribe(() => this.getInfoData());
    // config chart
    this.chart = createChart(document.getElementById('chart'), {
      height: 244,
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
        vertLines: {
          color: '#363843',
        },
        horzLines: {
          color: '#363843',
        },
      },
      leftPriceScale: {
        visible: true,
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });
    this.areaSeries = this.chart.addAreaSeries({
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: this.min,
          maxValue: this.max,
        },
      }),
    });
    this.areaSeries.applyOptions({
      lineColor: '#5EE6D0',
      topColor: 'rgba(136,198,203,0.12)',
      bottomColor: 'rgba(119, 182, 188, 0.01)',
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });
    this.initTooltip();
    this.currDate = moment(new Date()).format('DDMMYYYY_HHMMSS');
    this.getVotingPeriod();
  }

  drawChart(data, dateTime) {
    this.chartData = null;
    this.chartDataExp = [];
    let arr = []; // drawing chart array
    let arrPrint = []; // exporting data array

    // convert timeStamp to UNIX Timestamp format (for hour timeBar)
    dateTime.forEach((date, index) => {
      const ts = Math.floor(new Date(date).getTime() / 1000);
      const temp = { value: data[index], time: ts + 25200 }; // GMT+7
      arr.push(temp);
    });
    // push data to export csv array
    data.forEach((element, index) => {
      const temp = { value: element, time: dateTime[index] };
      arrPrint.push(temp);
    });

    this.chartData = arr;
    let transactionData = [];
    // setup data for export
    arrPrint.forEach((data) => {
      const dateF = this.datepipe.transform(data.time, 'dd-MM-yyyy:HH-mm-ss');
      this.chartDataExp.push({
        date: dateF,
        value: +data.value,
      });
      transactionData.push(+data.value);
    });
    this.chartDataExp = [
      {
        table1: this.chartDataExp,
      },
    ];
    this.areaSeries.setData(arr);
    this.chart.timeScale().fitContent();
    this.min = Math.min(...transactionData);
    this.max = Math.max(...transactionData);
  }

  //get all data for dashboard
  getInfoData() {
    this.getListBlock();
    this.getListTransaction();
    setTimeout(() => {
      // new
      this.getCoinInfo(this.chartRange);
      // old
      // this.updateBlockAndTxs(this.chartRange);
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

  getCoinInfo(type: string) {
    this.initTooltip();
    this.chartRange = type;
    this.commonService.getTokenByCoinId(this.chartRange, this.tokenIdGetPrice.AURA).subscribe(res => {
      //update data common
      this.getInfoCommon();
      if(res?.data?.length > 0) {
        this.tokenInfo = res.data;
        const dataX = (this.isPrice) ? res.data.map((i) => i.current_price) : res.data.map((i) => i.total_volume);
        let dataY = res.data.map((i) => i.timestamp);
        this.drawChart(dataX, dataY);
      }
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
    let type;
    switch (this.chartRange) {
      case '60m':
        type = 'in 60 minutes';
        break;
      case '24h':
        type = 'in about 24 hours';
        break;
      case '30d':
        type = 'in 30 days';
        break;
      case '12M':
        type = 'in 12 months';
        break;
    }
    this.SETTINGS_FOR_EXPORT = {
      // Table settings
      fileName: (this.isPrice ? 'Price_' : 'Volume_') + this.currDate,
      workSheets: [
        {
          sheetName: (this.isPrice ? 'Price' : 'Volume'),
          startingRowNumber: 2,
          gapBetweenTwoTables: 2,
          tableSettings: {
            table1: {
              tableTitle: (this.isPrice ? 'Price' : 'Volume') + ' value ' + type,
              headerDefinition: [
                {
                  name: 'Date',
                  key: 'date',
                },
                {
                  name: 'Value',
                  key: 'value',
                },
              ],
            },
          },
        },
      ],
    };
    const excelExport = new ExcelExport();
    excelExport.downloadExcel(this.SETTINGS_FOR_EXPORT, this.chartDataExp);
  }

  businessDayToString(businessDay) {
    return businessDay.year + '-' + businessDay.month + '-' + businessDay.day;
  }

  initTooltip() {
    const container = document.getElementById('chart');
    const toolTip = document.createElement('div');
    const label = this.isPrice ? 'Price' : 'Volume'
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
        const timestamp = moment.unix(param.time - 25200); // GMT+7
        const dateStr = timestamp.format('DD/MM/YYYY HH:mm:ss');
        toolTip.style.display = 'block';
        const price = param.seriesPrices.get(this.areaSeries);
        toolTip.innerHTML =
          '' +
          '<div class="floating-tooltip__header">'+label+'</div>' +
          '<div class="floating-tooltip__body"><div style="font-size: 14px; margin: 4px 0;">' +
          price +
          '</div><div>' +
          dateStr +
          '' +
          '</div></div>';
        const coordinate = this.areaSeries.priceToCoordinate(price);
        let shiftedCoordinate = param.point.x - 50;
        if (coordinate === null) {
          return;
        }
        shiftedCoordinate = Math.max(0, Math.min(container.clientWidth - this.toolTipWidth, shiftedCoordinate));
        const coordinateY =
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

  getVotingPeriod() {
    this.proposalService.getProposalList(20, null).subscribe((res) => {
      if (res?.data?.proposals) {
        let tempDta = res.data.proposals;
        this.voting_Period_arr = tempDta.filter((k) => k?.status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD);

        this.voting_Period_arr.forEach((pro, index) => {
          if (pro?.tally) {
            const { yes, no, no_with_veto, abstain } = pro?.tally;
            let totalVote = +yes + +no + +no_with_veto + +abstain;
            if (this.voting_Period_arr[index].tally) {
              this.voting_Period_arr[index].tally.yes = (+yes * 100) / totalVote || 0 ;
              this.voting_Period_arr[index].tally.no = (+no * 100) / totalVote || 0;
              this.voting_Period_arr[index].tally.no_with_veto = (+no_with_veto * 100) / totalVote || 0;
              this.voting_Period_arr[index].tally.abstain = (+abstain * 100) / totalVote || 0;
            }
          }
        });
        this.curr_voting_Period = this.voting_Period_arr[0];
      }
    });
  }

  getDataHeader() {
    return this.global.dataHeader;
  }

  async ngAfterViewInit() {
    const communityTaxRq = await this.commonService.getCommunityTax();
    const communityTax = communityTaxRq?.data?.params?.community_tax;
    let inflation;
    let bonded_tokens;
    let supply;
    setInterval(() => {
      if(!inflation && !bonded_tokens && !supply) {
        inflation = this.getDataHeader().inflation.slice(0, -1);
        bonded_tokens = this.getDataHeader().bonded_tokens.toString().slice(0, -1);
        supply = this.getDataHeader().supply.toString().slice(0, -1);
        this.staking_APR = (inflation * (1 - communityTax)) / (bonded_tokens/supply*100);
      }
    }, 500);
  }
}
