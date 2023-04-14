import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { fromBech32, toHex } from '@cosmjs/encoding';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { getFee } from 'src/app/core/utils/signing/fee';
import { NUMBER_CONVERT, NUM_BLOCK, TIME_OUT_CALL_API } from '../../../app/core/constants/common.constant';
import { CodeTransaction } from '../../../app/core/constants/transaction.enum';
import { DIALOG_STAKE_MODE, STATUS_VALIDATOR } from '../../../app/core/constants/validator.enum';
import { ESigningType, SIGNING_MESSAGE_TYPES } from '../../../app/core/constants/wallet.constant';
import { DataDelegateDto, ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { AccountService } from '../../../app/core/services/account.service';
import { CommonService } from '../../../app/core/services/common.service';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { NgxToastrService } from '../../../app/core/services/ngx-toastr.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { WalletService } from '../../../app/core/services/wallet.service';
import local from '../../../app/core/utils/storage/local';
import { Globals } from '../../../app/global/global';
import {VOTING_POWER_STATUS} from "src/app/core/constants/validator.constant";

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ValidatorsComponent implements OnInit, OnDestroy {
  votingPowerStatus = VOTING_POWER_STATUS;
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    // { matColumnDef: 'rank', headerCellDef: 'Rank', desktopOnly: true },
    { matColumnDef: 'title', headerCellDef: 'Validator', desktopOnly: true },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
    { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'up_time', headerCellDef: 'Uptime' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource = new MatTableDataSource<any>();
  dataSourceBk = new MatTableDataSource<any>();

  arrayDelegate = [];
  textSearch = '';
  rawData: any[];
  sortedData: any;
  dataModal: any;
  clicked = false;
  totalDelegator = 0;
  amountFormat = undefined;
  isExceedAmount = false;
  userAddress = '';
  selectedValidator: string;
  searchNullData = false;
  listStakingValidator = [];
  validatorDetail = '';
  statusValidator = STATUS_VALIDATOR;
  typeValidator = STATUS_VALIDATOR.Active;
  dataDelegate: DataDelegateDto = {};
  dialogMode = DIALOG_STAKE_MODE;
  isOpenStaking = false;
  modalReference: any;
  currentValidatorDialog: string;
  commissionLabel = null;
  lstValidator = [];
  lstReValidator = [];
  lstUndelegate = [];
  numberCode = 0;
  arrBlocksMiss = [];
  lstValidatorOrigin = [];
  lstUptime = [];
  TABS = [
    {
      key: 3,
      label: 'ACTIVE',
    },
    {
      key: 2,
      label: 'INACTIVE',
    },
  ];

  timerUnSub: Subscription;
  errorExceedAmount = false;
  isHandleStake = false;
  isLoading = false;
  isClaimRewardLoading = false;
  _routerSubscription: Subscription;
  destroyed$ = new Subject();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  pageYOffset = 0;
  scrolling = false;
  numBlock = NUM_BLOCK.toLocaleString('en-US', { minimumFractionDigits: 0 });
  staking_APR = 0;
  numberProposal = 0;
  validatorImgArr;
  maxPercentPower = 0;

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYOffset = window.pageYOffset;
  }

  chainInfo = this.environmentService.configValue.chain_info;
  denom = this.chainInfo.currencies[0].coinDenom;
  coinMinimalDenom = this.chainInfo.currencies[0].coinMinimalDenom;

  constructor(
    private validatorService: ValidatorService,
    public globals: Globals,
    private modalService: NgbModal,
    private accountService: AccountService,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private mappingErrorService: MappingErrorService,
    private router: Router,
    private layout: BreakpointObserver,
    private scroll: ViewportScroller,
    private environmentService: EnvironmentService
  ) {}

  async ngOnInit() {
    this.getBlocksMiss();
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.arrayDelegate = null;
        this.dataDelegate = null;
        this.lstUndelegate = null;
        this.userAddress = wallet.bech32Address;
        this.getDataWallet();
      } else {
        this.userAddress = null;
      }
    });
    this.getList();
    this._routerSubscription = this.router.events.subscribe(() => {
      if (this.modalReference) {
        this.modalReference.close();
      }
    });
    this.validatorService.stakingAPRSubject.subscribe((res) => {
      this.staking_APR = res ?? 0;
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

  getList(): void {
    this.validatorService.validators().subscribe((res: ResponseDto) => {
      if (res?.data?.length > 0) {
        this.lstValidatorOrigin = res.data;
        this.rawData = res.data;
        this.numberProposal = res.data[0]?.target_count;
        res.data.forEach((val) => {
          val.vote_count = val.vote_count || 0;
          val.participation = val.vote_count;
          val.power = val.power / NUMBER_CONVERT;
          val.up_time = Number(val.up_time.replace('%', ''));
          val.width_chart = val.up_time / 100;
        });

        let dataFilter = res.data.filter((event) =>
          this.typeValidator === this.statusValidator.Active
            ? event.status === this.statusValidator.Active
            : event.status !== this.statusValidator.Active,
        );

        //get init list Redelegate validator
        if (this.typeValidator === this.statusValidator.Active && !(this.lstValidator?.length > 0)) {
          this.lstValidator = dataFilter;
        }

        Object.keys(dataFilter).forEach((key) => {
          if (this.dataSource.data[key]) {
            Object.assign(this.dataSource.data[key], dataFilter[key]);
          } else {
            this.dataSource.data[key] = dataFilter[key];
          }
        });
        if (this.typeValidator === this.statusValidator.Active) {
          this.maxPercentPower = this.dataSource?.data[0]?.percent_power;
        }

        this.dataSourceBk = this.dataSource;
        this.dataSource.sort = this.sort;
        this.searchValidator();
      }
    });
  }

  getBlocksMiss() {
    this.validatorService.validatorsFromIndexer(null).subscribe((res) => {
      this.lstUptime = res.data.validators;
    });
  }

  calculatorUpTime(address) {
    const itemUptime = this.lstUptime.find((k) => k.account_address === address);
    let result = NUM_BLOCK;
    if (itemUptime) {
      result = NUM_BLOCK - +itemUptime.val_signing_info.missed_blocks_counter;
    }
    return result / 100;
  }

  changeType(type): void {
    this.typeValidator = type;
    let data = this.rawData.filter((event) =>
      type === this.statusValidator.Active
        ? event.status === this.statusValidator.Active
        : event.status !== this.statusValidator.Active,
    );
    this.dataSource.data = data;
    this.dataSourceBk = this.dataSource;
    this.searchValidator();
  }

  sortData(sort: Sort) {
    let data = this.rawData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'title':
          return this.compare(a.title, b.title, isAsc);
        case 'power':
          return this.compare(a.power, b.power, isAsc);
        case 'participation':
          return this.compare(a.participation, b.participation, isAsc);
        case 'uptime':
          return this.compare(a.uptime, b.uptime, isAsc);
        case 'commission':
          return this.compare(a.commission, b.commission, isAsc);
        default:
          return 0;
      }
    });

    let dataFilter = this.sortedData.filter((event) =>
      this.typeValidator === this.statusValidator.Active
        ? event.status === this.statusValidator.Active
        : event.status !== this.statusValidator.Active,
    );
    this.dataSource.data = dataFilter;
    this.dataSource.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  searchValidator(): void {
    this.searchNullData = false;
    let data;
    if (this.textSearch?.length > 0 || this.typeValidator !== STATUS_VALIDATOR.Active) {
      data = this.dataSourceBk.data.filter(
        (f) => f.title.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1,
      );
      this.dataSource = this.dataSourceBk;
      this.dataSource.data = data;
      if (data === undefined || data?.length === 0) {
        this.searchNullData = true;
      }
    } else {
      this.dataSource = this.dataSourceBk;
    }
  }

  handleViewPopup(data) {
    if (data.isClaimMode) {
      this.handleClaim();
    } else {
      this.viewPopupDetail(data.modal, data.address, this.dialogMode.Manage);
    }
  }

  viewPopupDetail(
    staticDataModal: any,
    address: string,
    dialogMode = DIALOG_STAKE_MODE.Delegate,
    isOpenStaking = false,
  ) {
    this.currentValidatorDialog = address;
    this.isClaimRewardLoading = true;
    const view = async () => {
      const account = this.walletService.getAccount();
      if (account && account.bech32Address) {
        this.clicked = true;
        this.amountFormat = null;
        this.isHandleStake = false;
        this.getValidatorDetail(address, staticDataModal);
        this.getListRedelegate(address);
      }
    };
    view();
    this.isOpenStaking = isOpenStaking;
    this.dataDelegate = this.dataDelegate || {};
    this.dataDelegate['dialogMode'] = dialogMode;
    this.isClaimRewardLoading = false;
  }

  getValidatorDetail(address, modal): void {
    this.validatorService.validatorsDetail(address).subscribe(
      (res) => {
        if (res?.data) {
          this.dataModal = res.data;
          this.dataModal.power = this.dataModal.power / NUMBER_CONVERT;
        }
        this.validatorDetail = this.listStakingValidator?.find((f) => f.validator_address === address);
        this.dataDelegate.validatorDetail = this.validatorDetail;
        // this.getListDelegators(address);

        this.clicked = false;
        this.isExceedAmount = false;
        this.errorExceedAmount = false;
        this.modalReference = this.modalService.open(modal, {
          keyboard: false,
          centered: true,
          size: 'lg',
          windowClass: 'modal-holder validator-modal',
        });
      },
      (error) => {},
    );
  }

  getListRedelegate(operatorAddress): void {
    let listDelegate = this.arrayDelegate?.map((a) => a.validator_address);
    let arrTemp = this.lstValidator.filter((k) => k.operator_address !== operatorAddress);
    arrTemp.forEach((f) => {
      f['isStaking'] = 0;
      if (listDelegate?.includes(f.operator_address)) {
        f['isStaking'] = 1;
      }
    });

    let lstSort = arrTemp.sort((a, b) => {
      return b.isStaking - a.isStaking || b.power - a.power;
    });
    this.lstReValidator = lstSort;
  }

  //Get data for wallet info and list staking
  getDataWallet() {
    const halftime = 10000;
    const currentUrl = this.router.url;
    let dataInfoWallet = {};
    if (this.userAddress && currentUrl.includes('/validators')) {
      forkJoin({
        dataWallet: this.accountService.getAccountDetail(this.userAddress),
        listDelegator: this.validatorService.validatorsDetailWallet(this.userAddress),
      }).subscribe(
        ({ dataWallet, listDelegator }) => {
          if (dataWallet) {
            this.dataDelegate = {
              ...this.dataDelegate,
              delegableVesting: dataWallet?.data?.delegable_vesting,
              delegatedToken: dataWallet?.data?.delegated,
              availableToken: dataWallet?.data?.available,
              stakingToken: dataWallet?.data?.stake_reward,
              historyTotalReward: listDelegator?.data?.claim_reward / NUMBER_CONVERT || 0,
              identity: listDelegator?.data?.identity,
            };
          }

          dataInfoWallet['arrayDelegate'] = JSON.stringify({});

          if (listDelegator) {
            this.listStakingValidator = listDelegator?.data?.delegations;

            if (this.currentValidatorDialog) {
              this.dataDelegate.validatorDetail = this.listStakingValidator?.find(
                (f) => f.validator_address === this.currentValidatorDialog,
              );
            }
            if (listDelegator?.data?.delegations.length > 0) {
              listDelegator?.data?.delegations.forEach((f) => {
                f.identity = f.identity;
                f.amount_staked = f.amount_staked / NUMBER_CONVERT;
                f.pending_reward = f.pending_reward / NUMBER_CONVERT;
                f.reward = f.reward / NUMBER_CONVERT;
              });
              //check amount staked > 0
              this.arrayDelegate = listDelegator?.data?.delegations.filter((x) => x.amount_staked > 0);
              dataInfoWallet['arrayDelegate'] = JSON.stringify(this.arrayDelegate);
            } else {
              this.arrayDelegate = null;
              this.lstUndelegate = null;
            }
          }

          this.getDataUndelegate();

          // store data wallet info
          dataInfoWallet['dataDelegate'] = JSON.stringify(this.dataDelegate);
          dataInfoWallet['lstUndelegate'] = JSON.stringify(this.lstUndelegate);
          local.setItem('dataInfoWallet', dataInfoWallet);
          setTimeout(() => {
            this.getDataWallet();
            this.getList();
          }, halftime);
        },
        (error) => {
          setTimeout(() => {
            this.getDataWallet();
            this.getList();
          }, halftime);
        },
      );
    }
  }

  // async getListDelegators(address) {
  //   const res = await this.validatorService.delegators(5, 0, address);
  //   this.totalDelegator = res?.data?.pagination?.total;
  // }

  checkAmountStaking(): void {
    let amountCheck;
    if (this.dataDelegate.dialogMode === this.dialogMode.Delegate) {
      amountCheck = this.getMaxAmountDelegate();
    } else if (
      this.dataDelegate.dialogMode === this.dialogMode.Redelegate ||
      this.dataDelegate.dialogMode === this.dialogMode.Undelegate
    ) {
      amountCheck = this.dataDelegate.validatorDetail.amount_staked;
    }
    this.isExceedAmount = false;
    if (+this.amountFormat > +amountCheck) {
      this.isExceedAmount = true;
    } else {
      this.isHandleStake = true;
    }
  }

  resetCheck() {
    this.isExceedAmount = false;
    this.errorExceedAmount = false;
  }

  handleStaking() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const executeStaking = async () => {
        this.isLoading = true;
        const { hash, error } = await this.walletService.signAndBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: [this.dataModal.operator_address],
            amount: {
              amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
              denom: this.coinMinimalDenom,
            },
          },
          senderAddress: this.userAddress,
          network: this.chainInfo,
          signingType: ESigningType.Keplr,
          chainId: this.walletService.chainId,
        });

        this.checkStatusExecuteBlock(hash, error);
      };

      executeStaking();
    }
  }

  handleClaim() {
    if (Number(this.dataDelegate.stakingToken) > 0) {
      const executeClaim = async () => {
        this.isLoading = true;
        this.isClaimRewardLoading = true;
        const { hash, error } = await this.walletService.signAndBroadcast(
          {
            messageType: SIGNING_MESSAGE_TYPES.CLAIM_REWARDS,
            message: {
              from: this.listStakingValidator,
            },
            senderAddress: this.userAddress,
            network: this.chainInfo,
            signingType: ESigningType.Keplr,
            chainId: this.walletService.chainId,
          },
          this.listStakingValidator?.length,
        );

        this.checkStatusExecuteBlock(hash, error);
      };
      executeClaim();
    }
  }

  handleUndelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const executeUnStaking = async () => {
        this.isLoading = true;
        const { hash, error } = await this.walletService.signAndBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.UNSTAKE,
          message: {
            from: [this.dataModal.operator_address],
            amount: {
              amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
              denom: this.coinMinimalDenom,
            },
          },
          senderAddress: this.userAddress,
          network: this.chainInfo,
          signingType: ESigningType.Keplr,
          chainId: this.walletService.chainId,
        });

        this.checkStatusExecuteBlock(hash, error);
      };
      executeUnStaking();
    }
  }

  handleRedelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const executeReStaking = async () => {
        this.isLoading = true;
        const { hash, error } = await this.walletService.signAndBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.RESTAKE,
          message: {
            src_address: this.dataModal.operator_address,
            to_address: this.selectedValidator,
            amount: {
              amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
              denom: this.coinMinimalDenom,
            },
          },
          senderAddress: this.userAddress,
          network: this.chainInfo,
          signingType: ESigningType.Keplr,
          chainId: this.walletService.chainId,
        });

        this.checkStatusExecuteBlock(hash, error);
      };
      executeReStaking();
    }
  }

  closeDialog(modal) {
    this.selectedValidator = '';
    modal.close('Close click');
    this.scrollToTop();
  }

  scrollToTop() {
    this.scroll.scrollToPosition([0, 0]);
    this.scrolling = true;
    setTimeout(() => {
      this.scrolling = !this.scrolling;
    }, 500);
  }

  changeTypePopup(type) {
    this.selectedValidator = '';
    this.isExceedAmount = false;
    this.amountFormat = undefined;
    this.dataDelegate.dialogMode = type;
    this.errorExceedAmount = false;
  }

  getMaxToken(type): void {
    if (type === this.dialogMode.Delegate) {
      //check amout for high fee
      let amountCheck = this.getMaxAmountDelegate();
      if (Number(amountCheck) < 0) {
        this.isExceedAmount = true;
        this.errorExceedAmount = true;
        amountCheck = '0';
      }
      this.amountFormat = amountCheck || 0;
    } else if (type === this.dialogMode.Undelegate) {
      this.amountFormat = this.dataDelegate.validatorDetail.amount_staked;
    } else if (type === this.dialogMode.Redelegate) {
      this.amountFormat = this.dataDelegate.availableToken;
    }
  }

  getMaxAmountDelegate() {
    let amount = (
      Number(this.dataDelegate.availableToken) +
      Number(this.dataDelegate.delegableVesting) -
      (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT
    ).toFixed(6);
    return amount;
  }

  setCommissionTitle(label: string) {
    this.commissionLabel = label;
  }

  checkStatusExecuteBlock(hash, error) {
    this.checkHashAction(hash);
    if (error) {
      if (error != 'Request rejected') {
        let errorMessage = this.mappingErrorService.checkMappingError('', error);
        this.toastr.error(errorMessage);
      }
      this.resetData();
    } else {
      setTimeout(() => {
        this.mappingErrorService.checkDetailTx(hash).then(() => {
          this.getList();
          this.getDataWallet();
        });
        this.resetData();
      }, TIME_OUT_CALL_API);
    }
  }

  resetData() {
    this.isLoading = false;
    this.isHandleStake = false;
    this.isClaimRewardLoading = false;
  }

  checkHashAction(hash) {
    const myInterval = setInterval(() => {
      if (hash) {
        this.toastr.loading(hash);
        this.isLoading = false;
        this.modalReference?.close();
        clearInterval(myInterval);
      }
    }, 500);
  }

  getDataUndelegate() {
    this.validatorService.validatorsListUndelegateWallet(this.userAddress).subscribe((res) => {
      let listUnDelegator = res;
      if (listUnDelegator) {
        this.lstUndelegate = [];
        const now = new Date();
        listUnDelegator.data.account_unbonding.forEach((data) => {
          data.entries.forEach((f) => {
            f['validator_identity'] = data.validator_description?.description?.identity;
            f.balance = f.balance / NUMBER_CONVERT;
            f.validator_address = data.validator_address;
            f.validator_name = this.lstValidatorOrigin.find((i) => i.operator_address === f.validator_address)?.title;
            f.jailed = data.validator_description?.jailed || false;
            let timeConvert = new Date(f.completion_time);
            if (now < timeConvert) {
              this.lstUndelegate.push(f);
            }
          });
        });

        this.lstUndelegate = this.lstUndelegate.sort((a, b) => {
          return this.compare(a.completion_time, b.completion_time, true);
        });
      }
    });
  }
}
