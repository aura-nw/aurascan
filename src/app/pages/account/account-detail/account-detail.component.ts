import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatLegacySelect as MatSelect } from '@angular/material/legacy-select';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChartComponent } from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { ACCOUNT_WALLET_COLOR } from '../../../core/constants/account.constant';
import { ACCOUNT_WALLET_COLOR_ENUM, WalletAcount } from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND } from '../../../core/constants/common.constant';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { Globals } from '../../../global/global';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from './chart-options';
import { isContract } from 'src/app/core/utils/common/validation';

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
  currentAccountDetail: any;
  chartCustomOptions = chartCustomOptions;

  // loading param check
  userAddress = '';
  modalReference: any;
  isNoData = false;

  destroyed$ = new Subject();
  timerUnSub: Subscription;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.configValue.timeStaking}`;

  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBTPick = 0;
  totalSBT = 0;
  isContractAddress = false;

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
        this.isContractAddress = isContract(this.currentAddress);
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
      this.getTotalSBT();
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
      limit: 100,
      offset: 0,
      receiverAddress: this.currentAddress,
      isEquipToken: true,
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe(
      (res) => {
        this.totalSBTPick = res.data.length;
      },
      () => {},
      () => {},
    );
  }

  getTotalSBT() {
    this.soulboundService.countTotalABT(this.currentAddress).subscribe(
      (res) => {
        this.totalSBT = res.data;
      },
      () => {},
      () => {},
    );
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  editPrivateName() {
    const userEmail = localStorage.getItem('userEmail');
    const dataNameTag = this.global.listNameTag?.find((k) => k.address === this.currentAddress);
    if (userEmail) {
      if (dataNameTag) {
        localStorage.setItem('setAddressNameTag', JSON.stringify(dataNameTag));
      } else {
        localStorage.setItem('setAddressNameTag', JSON.stringify({ address: this.currentAddress }));
      }
      this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
