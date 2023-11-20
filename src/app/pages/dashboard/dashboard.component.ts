import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import * as moment from 'moment';
import { NgxMaskService } from 'ngx-mask';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VOTING_STATUS } from 'src/app/core/constants/proposal.constant';
import { CoingeckoService } from 'src/app/core/data-services/coingecko.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { timeToUnix } from 'src/app/core/helpers/date';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { CHART_RANGE, PAGE_EVENT, TIMEOUT_ERROR, TOKEN_ID_GET_PRICE } from '../../core/constants/common.constant';
import { convertDataBlock, convertDataTransactionSimple, Globals } from '../../global/global';
import { CHART_CONFIG, DASHBOARD_AREA_SERIES_CHART_OPTIONS, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  chartRange = CHART_RANGE.H_24;
  chartRangeData = CHART_RANGE;
  PAGE_SIZE = PAGE_EVENT.PAGE_SIZE;

  templatesBlock: Array<TableTemplate> = [
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'proposer', headerCellDef: 'Proposer' },
    { matColumnDef: 'num_txs', headerCellDef: 'Txs' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsBlock: string[] = this.templatesBlock.map((dta) => dta.matColumnDef);
  dataSourceBlock: MatTableDataSource<any> = new MatTableDataSource();

  templatesTx: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumnsTx: string[] = this.templatesTx.map((dta) => dta.matColumnDef);
  dataSourceTx: MatTableDataSource<any> = new MatTableDataSource();
  dataTx: any[];
  timerUnSub: Subscription;

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];

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
  isLoadingBlock = true;
  isLoadingTx = true;
  isLoadingVoting = true;
  errTxtBlock = null;
  errTxtTxs = null;
  errTxtVoting = null;

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
  cacheData = [];
  logicalRangeChange$ = new Subject<{ from: number; to: number }>();
  endData = false;
  destroy$ = new Subject<void>();
  isMobileMatched = false;
  currentAddress = null;

  breakpoint$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroy$));

  constructor(
    public commonService: CommonService,
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private cdr: ChangeDetectorRef,
    public datepipe: DatePipe,
    private proposalService: ProposalService,
    private maskService: NgxMaskService,
    private walletService: WalletService,
    private validatorService: ValidatorService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private coingecko: CoingeckoService,
  ) {
    this.breakpoint$.subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnInit(): void {
    this.getInfoData();
    const period = 60000;
    this.timerUnSub = timer(period, period)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.getInfoData());

    this.initChart();
    this.getCoinInfo(this.chartRange);
    this.currDate = moment(new Date()).format('DDMMYYYY_HHMMSS');
    this.getVotingPeriod();
  }

  // config chart
  initChart() {
    this.chart = createChart(document.getElementById('chart'), DASHBOARD_CHART_OPTIONS);
    this.areaSeries = this.chart.addAreaSeries(DASHBOARD_AREA_SERIES_CHART_OPTIONS);
    this.initTooltip();
  }

  makeChartData(data: number[], time: any[]) {
    return time.map((el, index) => ({
      value: data[index],
      time: timeToUnix(el, 25200), // 2520s GMT+7
    }));
  }

  parseDataFromApi(dta: any[]) {
    const parseData = dta.map((el) => ({
      dataX: this.isPrice ? Number(el.current_price?.toFixed(6)) : Number(el.total_volume?.toFixed(6)),
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
    const chartLength = arr.length - 1;

    if (chartLength <= CHART_CONFIG[this.chartRange].initRange) {
      this.chart.timeScale().fitContent();
    } else {
      this.chart.timeScale().setVisibleLogicalRange({
        from: chartLength - CHART_CONFIG[this.chartRange].initRange,
        to: chartLength,
      });
    }

    this.chart.priceScale('left').applyOptions({
      scaleMargins: {
        top: 0.3,
        bottom: 0.4,
      },
    });
  }

  //get all data for dashboard
  getInfoData() {
    this.getMarketInfo();
    this.getListBlock();
    this.getListTransaction();
    this.cdr.detectChanges();
  }

  getMarketInfo() {
    this.coingecko.getCoinById(this.environmentService.coingecko?.ids[0]).subscribe((res) => {
      const { data } = res;
      if (data) {
        this.tokenInfo = data;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getListBlock(): void {
    const payload = {
      limit: this.PAGE_SIZE,
    };
    this.blockService.getDataBlock(payload).subscribe({
      next: (res) => {
        if (res?.block?.length > 0) {
          const blocks = convertDataBlock(res);
          this.dataSourceBlock = new MatTableDataSource(blocks);
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtBlock = e.message;
        } else {
          this.errTxtBlock = e.status + ' ' + e.statusText;
        }
        this.isLoadingBlock = false;
      },
      complete: () => {
        this.isLoadingBlock = false;
      },
    });
  }

  getListTransaction(): void {
    const payload = {
      limit: this.PAGE_SIZE,
    };
    this.transactionService.getListTx(payload).subscribe({
      next: (res) => {
        this.dataSourceTx.data = [];
        if (res?.transaction?.length > 0) {
          const txs = convertDataTransactionSimple(res, this.coinInfo);

          if (this.dataSourceTx.data.length > 0) {
            this.dataSourceTx.data = [...this.dataSourceTx.data, ...txs];
          } else {
            this.dataSourceTx.data = [...txs];
          }
          this.dataTx = txs;
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtTxs = e.message;
        } else {
          this.errTxtTxs = e.status + ' ' + e.statusText;
        }
        this.isLoadingTx = false;
      },
      complete: () => {
        this.isLoadingTx = false;
      },
    });
  }

  getCoinInfo(type: string) {
    this.originalData = [];
    this.originalDataArr = [];
    this.endData = false;

    this.initTooltip();
    this.chartRange = type;

    const { value } = CHART_CONFIG[this.chartRange];
    const days = value;

    this.coingecko
      .getChartData(
        this.environmentService.coingecko.ids[0],
        {
          days,
        },
        { type: this.chartRange },
      )
      .subscribe((res) => {
        if (res?.data?.length > 0) {
          const { dataX, dataY } = this.parseDataFromApi(res.data);

          this.originalData = [...this.originalData, ...res?.data];
          if (this.originalData.length > 0) {
            this.cacheData = this.originalData;
          }
          this.drawChartFirstTime(dataX, dataY);
        }
      });
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
          this.maskService.applyMask((price as number).toString(), 'separator') +
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
    let payload = {
      limit: 20,
    };
    this.proposalService.getProposalData(payload).subscribe({
      next: (res) => {
        if (res?.proposal) {
          let tempDta = res.proposal;
          this.voting_Period_arr = tempDta.filter((k) => k?.status === VOTING_STATUS.PROPOSAL_STATUS_VOTING_PERIOD);

          this.voting_Period_arr.forEach((pro, index) => {
            if (!pro['title']) {
              pro['title'] = pro.content.title;
            }

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
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxtVoting = e.message;
        } else {
          this.errTxtVoting = e.status + ' ' + e.statusText;
        }
        this.isLoadingVoting = false;
      },
      complete: () => {
        this.isLoadingVoting = false;
      },
    });
  }

  async ngAfterViewInit() {
    this.validatorService.stakingAPRSubject.subscribe((res) => {
      this.staking_APR = res ?? 0;
    });

    // re-draw chart when connect coin98 app in mobile
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet && this.isMobileMatched) {
        if (this.originalData.length === 0) {
          this.originalData = this.cacheData;
          this.chart.remove();
          this.chart = createChart(document.getElementById('chart'), DASHBOARD_CHART_OPTIONS);
          this.areaSeries = this.chart.addAreaSeries(DASHBOARD_AREA_SERIES_CHART_OPTIONS);
          this.areaSeries.setData(this.originalDataArr);
        }
      }
    });
  }

  navigateToCommunityPool(): void {
    this.router.navigate([`/community-pool`]);
  }
}
