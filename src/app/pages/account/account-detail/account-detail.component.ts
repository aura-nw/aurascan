import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacySelect as MatSelect } from '@angular/material/legacy-select';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import BigNumber from 'bignumber.js';
import { ChartComponent } from 'ng-apexcharts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EFeature } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { UserService } from 'src/app/core/services/user.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { transferAddress } from 'src/app/core/utils/common/address-converter';
import local from 'src/app/core/utils/storage/local';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { COSMOS_ACCOUNT_MESSAGE_TYPE, ACCOUNT_WALLET_COLOR } from '../../../core/constants/account.constant';
import { ACCOUNT_WALLET_COLOR_ENUM, ENameTag, WalletAcount } from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, STORAGE_KEYS } from '../../../core/constants/common.constant';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { CHART_OPTION, ChartOptions, chartCustomOptions } from './chart-options';
import { isAddress, isEvmAddress } from '../../../core/utils/common/validation';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit, OnDestroy {
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

  currentUrlAddress: string;
  accountAddress: string;
  currentAccountDetail: any;
  chartCustomOptions = chartCustomOptions;

  // loading param check
  connectedAddress = '';
  modalReference: any;
  isNoData = false;
  userEmail = '';

  destroyed$ = new Subject<void>();

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.stakingTime}`;

  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBTPick = 0;
  totalSBT = 0;
  isContractAddress = false;
  isWatchList = false;
  EFeature = EFeature;
  ENameTag = ENameTag;
  accountEvmAddress = '';
  accountType: 'cosmos' | 'evm' | '';
  tooltipCosmosText: string;
  tooltipEvmText: string;
  chainInfo = this.environmentService.chainInfo;
  isValidAddress = false;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
    private router: Router,
    private userService: UserService,
    private contractService: ContractService,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  get totalValue() {
    return BigNumber(this.totalValueToken).minus(this.totalValueNft);
  }

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];

    this.userService.user$?.pipe(takeUntil(this.destroyed$)).subscribe((currentUser) => {
      this.userEmail = currentUser ? currentUser.email : null;
    });

    //get data from client for my account
    this.walletService.walletAccount$.pipe(takeUntil(this.destroyed$)).subscribe((wallet) => {
      if (wallet) {
        this.connectedAddress = wallet.address;
      }
      this.getSBTPick();
      this.getTotalSBT();
    });

    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (params?.address) {
        if (
          !isEvmAddress(params.address) &&
          !isAddress(params.address, this.chainInfo.bech32Config.bech32PrefixAccAddr)
        ) {
          this.isValidAddress = false;
          return;
        }
        this.isValidAddress = true;

        const { accountAddress, accountEvmAddress } = transferAddress(
          this.chainInfo.bech32Config.bech32PrefixAccAddr,
          params?.address,
        );

        this.currentUrlAddress = params?.address;
        this.accountAddress = accountAddress;
        this.accountEvmAddress = accountEvmAddress;

        this.checkIsContract();
        this.getSBTPick();
        this.getTotalSBT();

        this.getAccountDetail();
        this.checkWatchList();

        const payload = {
          address: accountAddress,
        };
        this.userService.getAccountInfoOfAddress(payload).subscribe({
          next: (data: { account?: {type?: string; sequence?: number; pubkey?: object}[] } = {}) => {
            const { account } = data;

            if(!account?.length) return;
  
            const { type, sequence, pubkey = {} } = account[0] || {};

            if (type !== COSMOS_ACCOUNT_MESSAGE_TYPE || !sequence) return;

            if(!Object.keys(pubkey)?.length){
              this.accountType = 'evm';
              this.tooltipCosmosText = accountAddress;
              return;
            }else {
              this.accountType = 'cosmos';
              this.tooltipEvmText = accountEvmAddress;
              return;
            }
          },
        });
      }
    });
  }

  checkEvmContract() {
    this.contractService.findEvmContract(this.accountEvmAddress).subscribe({
      next: (res) => {
        if (res?.evm_smart_contract?.length > 0) {
          this.isContractAddress = true;
        }
      },
    });
  }

  checkIsContract() {
    if (this.commonService.isValidContract(this.accountAddress)) {
      this.isContractAddress = true;
    } else {
      this.checkEvmContract();
    }
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getAccountDetail(): void {
    this.isNoData = false;
    const halftime = 15000;
    this.accountService.getAccountDetail(this.accountAddress).subscribe(
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
    if (!this.accountAddress) {
      return;
    }

    const payload = {
      limit: 100,
      offset: 0,
      receiverAddress: this.accountAddress,
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
    if (this.accountAddress) {
      this.soulboundService.countTotalABT(this.accountAddress).subscribe((res) => {
        this.totalSBT = res.data;
      });
    }
  }

  checkWatchList() {
    // get watch list form local storage
    const lstWatchList = local.getItem<any>(STORAGE_KEYS.LIST_WATCH_LIST);
    if (lstWatchList?.find((k) => k.address === this.accountAddress)) {
      this.isWatchList = true;
    }
  }

  handleWatchList() {
    if (this.isWatchList) {
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.editWatchList();
    }
  }

  editWatchList() {
    if (this.userEmail) {
      local.setItem(STORAGE_KEYS.SET_ADDRESS_WATCH_LIST, {
        address: this.isContractAddress ? this.accountEvmAddress || this.accountAddress : this.accountAddress,
        type: this.isContractAddress ? 'contract' : 'account',
      });
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
