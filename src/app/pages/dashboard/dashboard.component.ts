import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { formatNumber } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VOTING_STATUS } from 'src/app/core/constants/proposal.constant';
import { CoingeckoService } from 'src/app/core/data-services/coingecko.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { timeToUnix } from 'src/app/core/helpers/date';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TokenService } from 'src/app/core/services/token.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { TableTemplate } from '../../../app/core/models/common.model';
import { BlockService } from '../../../app/core/services/block.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import {
  CHART_RANGE,
  NUMBER_6_DIGIT,
  PAGE_EVENT,
  TIMEOUT_ERROR,
  TITLE_LOGO
} from '../../core/constants/common.constant';
import { convertDataBlock, convertDataTransactionSimple, Globals } from '../../global/global';
import { CHART_CONFIG, DASHBOARD_AREA_SERIES_CHART_OPTIONS, DASHBOARD_CHART_OPTIONS } from './dashboard-chart-options';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  chartRange = CHART_RANGE.H_24;
  chartRangeData = CHART_RANGE;

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
  bannerList = this.environmentService.banner;
  coingeckoCoinId = this.environmentService.coingecko.ids[0];
  chainLogo = TITLE_LOGO;
  nativeName = this.environmentService.environment.nativeName;

  chart: IChartApi = null;
  areaSeries: ISeriesApi<'Area'> = null;
  chartDataExp = [];

  toolTipConfig = {
    width: 80,
    height: 80,
    margin: 15,
  };

  isLoadingBlock = true;
  isLoadingTx = true;
  isLoadingVoting = true;
  errTxtBlock = null;
  errTxtTxs = null;
  errTxtVoting = null;

  curr_voting_Period: any;
  voting_Period_arr = [];

  staking_APR = 0;
  tokenInfo: {
    currentPrice: number;
    marketCap: number;
    max_supply: number;
    priceChangePercentage24h: number;
    totalVolume: number;
    totalSupply: number;
  };

  originalData = [];
  originalDataArr = [];
  cacheData = [];
  endData = false;
  destroy$ = new Subject<void>();
  isMobileMatched = false;
  currentAddress = null;

  breakpoint$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall]);

  constructor(
    private blockService: BlockService,
    private transactionService: TransactionService,
    public global: Globals,
    private environmentService: EnvironmentService,
    private proposalService: ProposalService,
    private walletService: WalletService,
    private validatorService: ValidatorService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private coingecko: CoingeckoService,
    private tokenService: TokenService,
  ) {
    this.breakpoint$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    });
  }

  ngOnInit(): void {
    this.getMarketInfo();
    this.initChart();
    this.getCoinInfo(this.chartRange);
    this.getVotingPeriod();

    this.environmentService.latestBlockHeight$.pipe(takeUntil(this.destroy$)).subscribe((height) => {
      if (height !== undefined) {
        const latestHeight = height ? +height + 1 : height;
        this.getListBlock(latestHeight);
        this.getListTransaction(latestHeight);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      dataX: Number(el.current_price?.toFixed(6)),
      dataY: el.timestamp,
    }));

    try {
      // get last 2 items to check duplicated data
      const last2Item = parseData.slice(-2);
      const gapTime = moment(last2Item[1]?.dataY).diff(moment(last2Item[0]?.dataY));
      const FIVE_MINUTE = 300000; // In milliseconds

      if (gapTime <= FIVE_MINUTE) {
        parseData.pop();
      }
    } catch (error) {
      console.error(error);
    }

    return {
      dataX: parseData.map((el) => el.dataX),
      dataY: parseData.map((el) => el.dataY),
    };
  }

  drawChart(data, dateTime) {
    this.chartDataExp = [];
    let arr = []; // drawing chart array
    arr = this.makeChartData(data, dateTime);

    this.originalDataArr = arr;
    this.areaSeries.setData(arr);

    const chartLength = arr.length - 1;

    const from = chartLength - CHART_CONFIG[this.chartRange].initRange;

    if (chartLength <= CHART_CONFIG[this.chartRange].initRange) {
      this.chart.timeScale().fitContent();
    } else {
      this.chart.timeScale().setVisibleLogicalRange({
        from: from,
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

  getMarketInfo() {
    if (!this.environmentService.coingecko?.ids[0]) {
      return;
    }

    this.tokenService.tokensMarket$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.tokenInfo = res.find((k) => k.coinId === this.environmentService.coingecko?.ids[0]);
    });
  }

  getListBlock(height = null): void {
    const payload = {
      limit: PAGE_EVENT.PAGE_SIZE,
      nextHeight: height,
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

  getListTransaction(height = null): void {
    const payload = {
      limit: PAGE_EVENT.PAGE_SIZE,
      heightLT: height,
    };
    this.transactionService.getListTx(payload).subscribe({
      next: (res) => {
        this.dataSourceTx.data = [];
        if (res?.transaction?.length > 0) {
          const txs = convertDataTransactionSimple(res, this.environmentService.getDecimals());

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

    this.chartRange = type;

    const { value } = CHART_CONFIG[this.chartRange];

    this.coingecko
      .getChartData(
        this.environmentService.coingecko.ids[0],
        {
          days: value,
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

          this.drawChart(dataX, dataY);
        }
      });
  }

  initTooltip() {
    const container = document.getElementById('chart');
    const toolTip = document.createElement('div');

    toolTip.className = 'floating-tooltip-2';
    container.appendChild(toolTip);

    const toolTipTemplate = _.template(
      '<div class="floating-tooltip__header">Price</div><div class="floating-tooltip__body"><div style="font-size: 14px; margin: 4px 0">${price}</div><div>${dateStr}</div></div>',
    );

    // update tooltip
    this.chart.subscribeCrosshairMove(({ point, time, seriesPrices }) => {
      if (
        point === undefined ||
        !time ||
        point?.x < 0 ||
        point?.x > container.clientWidth ||
        point?.y < 0 ||
        point?.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
        return;
      }

      toolTip.style.display = 'block';

      const timestamp = moment.unix((time as number) - 25200); // GMT+7
      const dateStr = timestamp.format('DD/MM/YYYY HH:mm:ss');
      const price = seriesPrices.get(this.areaSeries);

      toolTip.innerHTML = toolTipTemplate({
        dateStr,
        price: formatNumber(price as number, 'en-GB', NUMBER_6_DIGIT),
      });

      const coordinate = this.areaSeries.priceToCoordinate(price as number);

      if (coordinate === null) {
        return;
      }

      const { width, height, margin } = this.toolTipConfig;
      const { clientWidth, clientHeight } = container;

      const shiftedCoordinate = Math.max(0, Math.min(clientWidth - width, point.x - 50));

      const heightOffset = height - margin;

      const coordinateY =
        coordinate - heightOffset > 0
          ? coordinate - heightOffset
          : Math.max(0, Math.min(clientHeight - heightOffset, coordinate + margin));

      toolTip.style.left = shiftedCoordinate + 'px';
      toolTip.style.top = coordinateY + 'px';
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
    this.validatorService.stakingAPRSubject
      .asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.staking_APR = res ?? 0;
      });

    // re-draw chart when connect coin98 app in mobile
    this.walletService.walletAccount$.pipe(takeUntil(this.destroy$)).subscribe((wallet) => {
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
