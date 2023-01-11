import { DatePipe, DecimalPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import * as moment from 'moment';
import { MaskPipe } from 'ngx-mask';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VOTING_STATUS } from 'src/app/core/constants/proposal.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { timeToUnix } from 'src/app/core/helpers/date';
import { exportChart } from 'src/app/core/helpers/export';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TokenService } from 'src/app/core/services/token.service';
import { getInfo } from 'src/app/core/utils/common/info-common';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { CHART_RANGE, PAGE_EVENT, TOKEN_ID_GET_PRICE } from '../../core/constants/common.constant';
import { convertDataBlock, convertDataTransaction, Globals } from '../../global/global';
import { DASHBOARD_AREA_SERIES_CHART_OPTIONS, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  chartRange = CHART_RANGE.M_60;
  chartRangeData = CHART_RANGE;
  PAGE_SIZE = PAGE_EVENT.PAGE_SIZE;
  // public chartOptions: Partial<ChartOptions> = DASHBOARD_CHART_OPTIONS;

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

  chart: IChartApi = null;
  areaSeries: ISeriesApi<'Area'> = null;
  chartDataExp = [];

  toolTipWidth = 80;
  toolTipHeight = 80;
  toolTipMargin = 15;

  min = 0;
  max = 1000;

  currDate;
  isPrice = true;

  curr_voting_Period;
  voting_Period_arr = [];

  staking_APR = 0;
  tokenIdGetPrice = TOKEN_ID_GET_PRICE;
  tokenInfo: {
    coinId: string;
    current_price: number;
    market_cap: number;
    max_supply: number;
    price_change_percentage_24h: number;
    timestamp: string;
    total_volume: number;
  };

  originalData = [];
  originalDataArr = [];
  logicalRangeChange$ = new Subject<{ from: number; to: number }>();

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
    private maskService: MaskPipe,
    private token: TokenService,
  ) {}

  ngOnInit(): void {
    this.getInfoData();
    const halftime = 60000;
    // this.timerUnSub = timer(halftime, halftime).subscribe(() => this.getInfoData());

    this.initChart();
    this.currDate = moment(new Date()).format('DDMMYYYY_HHMMSS');
    this.getVotingPeriod();
  }

  // config chart
  initChart() {
    this.chart = createChart(document.getElementById('chart'), DASHBOARD_CHART_OPTIONS);
    this.areaSeries = this.chart.addAreaSeries(DASHBOARD_AREA_SERIES_CHART_OPTIONS);
    // this.areaSeries.applyOptions();
    this.initTooltip();

    this.subscribeVisibleLogicalRangeChange();
  }

  subscribeVisibleLogicalRangeChange() {
    this.logicalRangeChange$.pipe(debounceTime(500)).subscribe(({ from, to }) => {
      // offset 5 record
      if (from <= 5) {
        const minDate = new Date(this.originalData[0].timestamp).toISOString();
        this.commonService
          .getTokenMetrics({
            range: this.chartRange,
            coinId: this.tokenIdGetPrice.AURA,
            minDate,
          })
          .subscribe((res) => {
            //update data common
            if (res?.data?.length > 0) {
              const { dataX, dataY } = this.parseDataFromApi(res.data);

              const chartData = this.makeChartData(dataX, dataY);

              this.originalData = [...res?.data, ...this.originalData];
              this.originalDataArr = [...chartData, ...this.originalDataArr];

              this.areaSeries.setData(this.originalDataArr);
            }
          });
      }
    });
  }

  chartEvent() {
    this.chart.timeScale().subscribeVisibleLogicalRangeChange(({ from, to }) => {
      this.logicalRangeChange$.next({ from, to });
    });
  }

  makeChartData(data: number[], time: any[]) {
    return time.map((el, index) => ({
      value: data[index],
      time: timeToUnix(el, 25200), // 2520s GMT+7
    }));
  }

  parseDataFromApi(dta: any[]) {
    const parseData = dta.map((el) => ({
      dataX: this.isPrice ? el.current_price : el.total_volume,
      dataY: el.timestamp,
    }));
    return {
      dataX: parseData.map((el) => el.dataX),
      dataY: parseData.map((el) => el.dataY),
    };
  }

  drawChartFirstTime(data, dateTime) {
    this.chartDataExp = [];
    let arr = []; // drawing chart array

    arr = this.makeChartData(data, dateTime);

    this.originalDataArr = arr;

    this.areaSeries.applyOptions({
      priceFormat: {
        type: this.isPrice ? 'price' : 'volume',
      },
    });

    this.areaSeries.setData(arr);

    this.chart.timeScale().fitContent();
    this.chart.priceScale().applyOptions({
      autoScale: true,
    });
  }

  //get all data for dashboard
  getInfoData() {
    this.getMarketInfo();
    this.getListBlock();
    this.getListTransaction();
    setTimeout(() => {
      this.getCoinInfo(this.chartRange);
    }, 1000);
    this.cdr.detectChanges();
  }

  getMarketInfo() {
    this.token.getTokenMarket().subscribe((res) => {
      const { data } = res;
      if (data) {
        this.tokenInfo = data;
      }
    });
  }

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
      this.drawChartFirstTime(data1, categories);
    });
  }

  getCoinInfo(type: string) {
    this.initTooltip();
    this.chartRange = type;
    this.commonService
      .getTokenMetrics({
        range: this.chartRange,
        coinId: this.tokenIdGetPrice.AURA,
      })
      .subscribe((res) => {
        //update data common
        this.getInfoCommon();
        if (res?.data?.length > 0) {
          // const dataX = this.isPrice ? res.data.map((i) => i.current_price) : res.data.map((i) => i.total_volume);
          // let dataY = res.data.map((i) => i.timestamp);

          // const {} =
          const { dataX, dataY } = this.parseDataFromApi(res.data);

          this.originalData = [...this.originalData, ...res?.data];
          this.drawChartFirstTime(dataX, dataY);

          this.chartEvent();
        }
      });
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.global, res.data);
    });
  }

  exportChart() {
    const exportData = this.originalData.map((item) => {
      const dateF = this.datepipe.transform(new Date(item.timestamp), 'dd-MM-yyyy:HH-mm-ss');
      return {
        date: dateF,
        value: this.isPrice ? item.current_price : item.total_volume,
      };
    });

    exportChart(
      [
        {
          table1: exportData,
        },
      ],
      this.chartRange,
      this.isPrice,
      this.currDate,
    );
  }

  initTooltip() {
    const container = document.getElementById('chart');
    const toolTip = document.createElement('div');
    const label = this.isPrice ? 'Price' : 'Volume';
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
        const timestamp = moment.unix((param.time as number) - 25200); // GMT+7
        const dateStr = timestamp.format('DD/MM/YYYY HH:mm:ss');
        toolTip.style.display = 'block';
        const price = param.seriesPrices.get(this.areaSeries);
        toolTip.innerHTML =
          '' +
          '<div class="floating-tooltip__header">' +
          label +
          '</div>' +
          '<div class="floating-tooltip__body"><div style="font-size: 14px; margin: 4px 0;">' +
          this.maskService.transform(price as number, 'separator') +
          '</div><div>' +
          dateStr +
          '' +
          '</div></div>';
        const coordinate = this.areaSeries.priceToCoordinate(price as number);
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
              this.voting_Period_arr[index].tally.yes = (+yes * 100) / totalVote || 0;
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
      if (!inflation && !bonded_tokens && !supply) {
        inflation = this.getDataHeader().inflation.slice(0, -1);
        bonded_tokens = this.getDataHeader().bonded_tokens.toString().slice(0, -1);
        supply = this.getDataHeader().supply.toString().slice(0, -1);
        this.staking_APR = (inflation * (1 - communityTax)) / ((bonded_tokens / supply) * 100);
      }
    }, 500);
  }
}
