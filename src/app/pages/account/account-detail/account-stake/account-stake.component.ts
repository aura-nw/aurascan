import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnChanges } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ACCOUNT_WALLET_COLOR } from 'src/app/core/constants/account.constant';
import { PageEventType, StakeModeAccount } from 'src/app/core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { IAccountDetail } from 'src/app/core/models/account.model';
import { TableTemplate } from 'src/app/core/models/common.model';
import { Globals } from 'src/app/global/global';
import { chartCustomOptions, ChartOptions } from '../chart-options';

@Component({
  selector: 'app-account-stake',
  templateUrl: './account-stake.component.html',
  styleUrls: ['./account-stake.component.scss'],
})
export class AccountStakeComponent implements OnChanges {
  @Input() chartOptions: Partial<ChartOptions>;
  @Input() chartCustomOptions = chartCustomOptions;
  @Input() currentAccountDetail: IAccountDetail;

  stakeLoading = true;
  currentStake = StakeModeAccount.Delegations;
  stakeMode = StakeModeAccount;
  pageEventType = PageEventType;
  chartLoading = false;

  TABS_STAKE = [
    {
      key: StakeModeAccount.Delegations,
      label: 'Delegations',
    },
    {
      key: StakeModeAccount.Unbondings,
      label: 'Unbondings',
    },
    {
      key: StakeModeAccount.Redelegations,
      label: 'Redelegations',
    },
    {
      key: StakeModeAccount.Vestings,
      label: 'Vestings',
    },
  ];

  templatesDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'COMMON.AMOUNT' },
    { matColumnDef: 'reward', headerCellDef: 'Reward' },
  ];
  displayedColumnsDelegation: string[] = this.templatesDelegation.map((dta) => dta.matColumnDef);
  dataSourceDelegation: MatTableDataSource<any>;

  templatesUnBonding: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Validator' },
    { matColumnDef: 'amount', headerCellDef: 'COMMON.AMOUNT' },
    { matColumnDef: 'completion_time', headerCellDef: 'Completion Time' },
  ];
  displayedColumnsUnBonding: string[] = this.templatesUnBonding.map((dta) => dta.matColumnDef);
  dataSourceUnBonding: MatTableDataSource<any>;

  templatesReDelegation: Array<TableTemplate> = [
    { matColumnDef: 'validator_src_name', headerCellDef: 'COMMON.FROM' },
    { matColumnDef: 'validator_dst_name', headerCellDef: 'COMMON.TO' },
    { matColumnDef: 'amount', headerCellDef: 'COMMON.AMOUNT' },
    { matColumnDef: 'completion_time', headerCellDef: 'COMMON.TIME' },
  ];
  displayedColumnsReDelegation: string[] = this.templatesReDelegation.map((dta) => dta.matColumnDef);
  dataSourceReDelegation: MatTableDataSource<any>;

  templatesVesting: Array<TableTemplate> = [
    { matColumnDef: 'type_format', headerCellDef: 'LABEL.TYPE' },
    { matColumnDef: 'amount', headerCellDef: 'COMMON.AMOUNT' },
    { matColumnDef: 'vesting_schedule', headerCellDef: 'Vesting Schedule' },
  ];
  displayedColumnsVesting: string[] = this.templatesVesting.map((dta) => dta.matColumnDef);
  dataSourceVesting: MatTableDataSource<any>;

  pageDataDelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataUnbonding: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataRedelegation: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  pageDataVesting: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: PAGE_EVENT.PAGE_SIZE,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.stakingTime}`;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    public global: Globals,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];

    this.dataSourceDelegation = new MatTableDataSource();
    this.dataSourceUnBonding = new MatTableDataSource();
    this.dataSourceReDelegation = new MatTableDataSource();
    this.dataSourceVesting = new MatTableDataSource();

    if (this.currentAccountDetail?.delegations) {
      this.dataSourceDelegation.data = this.currentAccountDetail?.delegations;
      this.pageDataDelegation.length = this.currentAccountDetail?.delegations?.length;
    }
    if (this.currentAccountDetail?.unbonding_delegations) {
      this.dataSourceUnBonding.data = this.currentAccountDetail?.unbonding_delegations;
      this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations?.length;
    }
    if (this.currentAccountDetail?.redelegations) {
      this.dataSourceReDelegation.data = this.currentAccountDetail?.redelegations;
      this.pageDataRedelegation.length = this.currentAccountDetail?.redelegations?.length;
    }
    if (this.currentAccountDetail?.vesting) {
      this.dataSourceVesting.data = [this.currentAccountDetail?.vesting];
      this.pageDataVesting.length = 1;
    }

    setTimeout(() => {
      this.stakeLoading = false;
    }, 2000);
  }

  ngOnChanges(): void {
    if (this.currentAccountDetail) {
      this.stakeLoading = false;
      if (this.currentAccountDetail?.delegations) {
        this.dataSourceDelegation.data = this.currentAccountDetail?.delegations;
        this.pageDataDelegation.length = this.currentAccountDetail?.delegations?.length;
      }
      if (this.currentAccountDetail?.unbonding_delegations) {
        this.dataSourceUnBonding.data = this.currentAccountDetail?.unbonding_delegations;
        this.pageDataUnbonding.length = this.currentAccountDetail?.unbonding_delegations?.length;
      }
      if (this.currentAccountDetail?.redelegations) {
        this.dataSourceReDelegation.data = this.currentAccountDetail?.redelegations;
        this.pageDataRedelegation.length = this.currentAccountDetail?.redelegations?.length;
      }
      if (this.currentAccountDetail?.vesting) {
        this.dataSourceVesting.data = [this.currentAccountDetail?.vesting];
        this.pageDataVesting.length = 1;
      }
    }
  }

  changePage(page: any): void {
    switch (page.pageEventType) {
      case this.pageEventType.Delegation:
        this.pageDataDelegation.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Unbonding:
        this.pageDataUnbonding.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Redelegation:
        this.pageDataRedelegation.pageIndex = page.pageIndex;
        break;
      case this.pageEventType.Vestings:
        this.pageDataVesting.pageIndex = page.pageIndex;
        break;
      default:
        break;
    }
  }
}
