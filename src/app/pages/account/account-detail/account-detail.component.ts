import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartComponent } from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LIMIT_NUM_SBT } from 'src/app/core/constants/soulbound.constant';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { ACCOUNT_WALLET_COLOR, TABS_TITLE_ACCOUNT } from '../../../core/constants/account.constant';
import { ACCOUNT_WALLET_COLOR_ENUM, StakeModeAccount, WalletAcount } from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND } from '../../../core/constants/common.constant';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { Globals } from '../../../global/global';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from './chart-options';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  @ViewChild('assetTypeSelect') assetTypeSelect: MatSelect;
  @HostListener('window:scroll', ['$event'])
  closeOptionPanelSection(_) {
    if (this.assetTypeSelect !== undefined) {
      this.assetTypeSelect.close();
    }
  }
  public chartOptions: Partial<ChartOptions>;
  @ViewChild('walletChart') chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  currentAddress: string;
  currentKey = null;
  currentAccountDetail: any;
  textSearch = '';

  chartCustomOptions = chartCustomOptions;

  // loading param check
  userAddress = '';
  modalReference: any;
  isNoData = false;

  destroyed$ = new Subject();
  timerUnSub: Subscription;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  coinInfo = this.environmentService.configValue.chain_info.currencies[0];
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  TABS = TABS_TITLE_ACCOUNT;

  currentStake = StakeModeAccount.Delegations;
  stakeMode = StakeModeAccount;
  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBT = 0;

  isSent = true;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    public global: Globals,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
    private router: Router,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];
    this.route.params.subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.loadDataTemp();
        this.getAccountDetail();
      }
    });
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.timerUnSub) {
      this.timerUnSub.unsubscribe();
    }
  }

  loadDataTemp(): void {
    //get data from client for my account
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      }
      this.getSBTPick();
    });

    let retrievedObject = localStorage.getItem('accountDetail');
    if (retrievedObject) {
      let data = JSON.parse(retrievedObject);
      let dataAccount = JSON.parse(data?.dataAccount);
      if (dataAccount && dataAccount.acc_address === this.currentAddress) {
        this.currentAccountDetail = dataAccount;

        this.chartOptions = JSON.parse(data?.dataChart);
      }
    }
  }

  getAccountDetail(): void {
    this.isNoData = false;
    const halftime = 15000;
    this.accountService.getAccountDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.data.code === 200 && !res.data?.data) {
          this.isNoData = true;
          setTimeout(() => {
            this.getAccountDetail();
          }, halftime);
          return;
        }

        if (res?.data) {
          this.currentAccountDetail = res.data;
          this.chartOptions.series = [];
          if (+this.currentAccountDetail.commission > 0) {
            this.chartOptions.labels.push(ACCOUNT_WALLET_COLOR_ENUM.Commission);
            this.chartOptions.colors.push(WalletAcount.Commission);
            this.chartCustomOptions.push({
              name: ACCOUNT_WALLET_COLOR_ENUM.Commission,
              color: WalletAcount.Commission,
              amount: '0.000000',
            });
          } else {
            this.chartCustomOptions = chartCustomOptions;
          }

          this.chartCustomOptions.forEach((f) => {
            switch (f.name) {
              case ACCOUNT_WALLET_COLOR_ENUM.Available:
                f.amount = this.currentAccountDetail.available;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Delegated:
                f.amount = this.currentAccountDetail.delegated;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.StakingReward:
                f.amount = this.currentAccountDetail.stake_reward;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Commission:
                f.amount = this.currentAccountDetail.commission;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Unbonding:
                f.amount = this.currentAccountDetail.unbonding;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.DelegableVesting:
                f.amount = this.currentAccountDetail?.delegable_vesting;
                break;
              default:
                break;
            }
            f.amount = f.amount || '0';
            this.chartOptions.series.push(Number(f.amount));
          });
        }
      },
      () => {},
      () => {},
    );
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'sm',
      windowClass: 'modal-holder contact-qr-modal',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  reloadData() {
    location.reload();
  }

  getSBTPick() {
    const payload = {
      receiverAddress: this.currentAddress,
      limit: LIMIT_NUM_SBT,
    };

    this.soulboundService.getSBTPick(payload).subscribe((res) => {
      if (this.userAddress && this.currentAddress !== this.userAddress) {
        res.data = res.data.filter((k) => k.picked);
      }
      this.totalSBT = res.data.length;
    });
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  editPrivateName() {
    this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
  }
}
