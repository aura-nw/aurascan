import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VOTING_POWER_STATUS } from 'src/app/core/constants/validator.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import { getFee } from 'src/app/core/utils/signing/fee';
import { NUMBER_CONVERT, NUM_BLOCK, TIME_OUT_CALL_API } from '../../../app/core/constants/common.constant';
import { DIALOG_STAKE_MODE, STATUS_VALIDATOR, VOTING_POWER_LEVEL } from '../../../app/core/constants/validator.enum';
import { ESigningType, SIGNING_MESSAGE_TYPES } from '../../../app/core/constants/wallet.constant';
import { DataDelegateDto, TableTemplate } from '../../../app/core/models/common.model';
import { AccountService } from '../../../app/core/services/account.service';
import { CommonService } from '../../../app/core/services/common.service';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { NgxToastrService } from '../../../app/core/services/ngx-toastr.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { WalletService } from '../../../app/core/services/wallet.service';
import { Globals } from '../../../app/global/global';

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
    { matColumnDef: 'title', headerCellDef: 'Validator', desktopOnly: true },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
    { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'uptime', headerCellDef: 'Uptime' },
    { matColumnDef: 'action', headerCellDef: '' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource = new MatTableDataSource<any>();

  lstValidatorData = [];
  textSearch = '';
  rawData: any[];
  sortedData: any;
  clicked = false;
  totalDelegator = 0;
  amountFormat = undefined;
  isExceedAmount = false;
  userAddress = '';
  selectedValidator: string;
  searchNullData = false;
  listStakingValidator = [];
  validatorDetail: any;
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
  validatorImgArr;
  maxPercentPower = 0;
  typeActive = 'BOND_STATUS_BONDED';
  countProposal = 0;
  dataUserDelegate;

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
    private environmentService: EnvironmentService,
    private proposalService: ProposalService,
  ) {}

  async ngOnInit() {
    // this.getBlocksMiss();
    this.getCountProposal();
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
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
    this.validatorService.getDataValidator(null).subscribe((res) => {
      this.lstUptime = res.validator;
      if (res.validator?.length > 0) {
        let dataFilter = res.validator.filter((event) =>
          this.typeValidator === this.statusValidator.Active
            ? event.status === this.typeActive
            : event.status !== this.typeActive,
        );

        res.validator.forEach((val) => {
          val.power = balanceOf(val.tokens);
          val.width_chart = val.uptime / 100;
          val.title = val.description?.moniker;
          val.commission = (+val.commission?.commission_rates?.rate || +val?.commission?.rate || 0).toFixed(4);
          val.percent_power = val.percent_voting_power.toFixed(2);
          val.participation = val.vote_aggregate?.aggregate?.count || 0;
          val.identity = val.description.identity;

          if (val.status === this.typeActive) {
            val.status = this.statusValidator.Active;
          }

          let equalPT = 0;
          const numValidatorActive = res.validator_aggregate?.aggregate?.count || 0;
          if (numValidatorActive > 0) {
            equalPT = Number((100 / numValidatorActive).toFixed(2));
          }
          if (Number(val.percent_power) < equalPT) {
            val.voting_power_level = VOTING_POWER_LEVEL.GREEN;
          } else if (Number(val.percent_power) < 3 * equalPT) {
            val.voting_power_level = VOTING_POWER_LEVEL.YELLOW;
          } else {
            val.voting_power_level = VOTING_POWER_LEVEL.RED;
          }
        });

        this.lstValidatorOrigin = res.validator;
        this.rawData = res.validator;

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

        this.dataSource.sort = this.sort;
        this.searchValidator();
      }
    });
  }

  getCountProposal() {
    this.proposalService.getCountProposal().subscribe((res) => {
      this.countProposal = res.proposal_aggregate.aggregate.count || 0;
    });
  }

  calculatorUpTime(address) {
    const itemUptime = this.lstUptime?.find((k) => k.account_address === address);
    let result = NUM_BLOCK;
    if (itemUptime) {
      result = NUM_BLOCK - +itemUptime.missed_blocks_counter;
    }
    return result / 100;
  }

  changeType(type): void {
    this.typeValidator = type;
    this.searchValidator();
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      this.sortedData = this.dataSource;
      return;
    }

    this.sortedData = this.dataSource?.data?.sort((a, b) => {
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

    this.dataSource.data = this.sortedData;
    this.dataSource.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  searchValidator(): void {
    let result = [];
    if (this.typeValidator === this.statusValidator.Active) {
      result = this.rawData.filter((event) => event.status === this.statusValidator.Active);
    } else {
      let lstJail = this.rawData.filter((event) => event.status !== this.statusValidator.Active && event.jailed);
      let lstInactive = this.rawData.filter((event) => event.status !== this.statusValidator.Active && !event.jailed);
      result = [...lstInactive, ...lstJail];
    }

    this.textSearch = this.textSearch?.trim();
    if (this.textSearch?.length > 0) {
      this.dataSource.data = result?.filter(
        (f) => f.title.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1,
      );
    } else {
      this.dataSource.data = result;
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
    const payload = {
      limit: 1,
      offset: 0,
      operatorAddress: address,
    };
    this.validatorService.getDataValidator(payload).subscribe(
      (res) => {
        const data = res?.validator[0];
        this.validatorDetail = this.lstValidatorData?.find((f) => f.validator_address === address);
        this.validatorDetail = {
          ...this.validatorDetail,
          validator_address: this.validatorDetail?.validator_address || address,
          jailed: data.jailed ? 1 : 0,
          identity: data.description.identity,
          image_url: data.image_url,
          commission: (+data.commission?.commission_rates?.rate || +data?.commission?.rate || 0)?.toFixed(4),
          percent_power: data.percent_voting_power?.toFixed(2),
          power: balanceOf(data.tokens),
          title: data.description?.moniker,
        };

        this.dataDelegate.validatorDetail = this.validatorDetail;
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
    let listDelegate = this.lstValidatorData?.map((a) => a.validator_address);
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
    if (this.userAddress && currentUrl.includes('/validators')) {
      this.accountService.getAccountDetail(this.userAddress).subscribe(
        (dataWallet) => {
          if (dataWallet) {
            this.dataDelegate = {
              ...this.dataDelegate,
              delegableVesting: dataWallet?.data?.delegable_vesting,
              delegatedToken: dataWallet?.data?.delegated,
              availableToken: dataWallet?.data?.available,
              stakingToken: dataWallet?.data?.stake_reward,
            };
          }

          this.getDataUser();
          this.getListUndelegate();
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

  async getDataUser() {
    const [delegation, reward] = await Promise.all([
      this.validatorService.getDelegationLCD(this.userAddress),
      this.validatorService.getRewardLCD(this.userAddress),
    ]);

    let lstTempDelegate = [];
    reward.data?.rewards.forEach((element) => {
      const validatorDetail = this.lstValidatorOrigin?.find((i) => i.operator_address === element.validator_address);
      const dataDelegation = delegation.data?.delegation_responses?.find(
        (k) => k.delegation?.validator_address === element.validator_address,
      );
      const dataReward = reward.data?.rewards?.find((k) => k.validator_address === element.validator_address);

      let item = {
        amount_staked: balanceOf(dataDelegation.balance?.amount),
        pending_reward: 0,
        validator_identity: validatorDetail.description?.identity,
        validator_name: validatorDetail.description?.moniker,
        validator_address: validatorDetail.operator_address,
        image_url: validatorDetail.image_url,
        jailed: validatorDetail.jailed,
      };

      if (dataReward?.reward[0]?.amount) {
        const amount = Number(_.get(dataReward, 'reward[0].amount'));
        item['pending_reward'] = balanceOf(amount);
      }
      lstTempDelegate.push(item);
    });

    this.lstValidatorData = lstTempDelegate;
    this.dataUserDelegate = {
      claim_reward: _.get(reward, 'data.total[0].amount'),
      delegations: this.lstValidatorData,
    };
  }

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
            to: [this.validatorDetail.validator_address],
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
              from: this.lstValidatorData,
            },
            senderAddress: this.userAddress,
            network: this.chainInfo,
            signingType: ESigningType.Keplr,
            chainId: this.walletService.chainId,
          },
          this.lstValidatorData?.length,
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
            from: [this.validatorDetail.validator_address],
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
            src_address: this.validatorDetail.validator_address,
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

  async getListUndelegate() {
    const res = await this.validatorService.getListUndelegateLCD(this.userAddress);
    let listUnDelegator = res;
    if (listUnDelegator) {
      this.lstUndelegate = [];
      const now = new Date();

      listUnDelegator.data.unbonding_responses.forEach((data) => {
        data.entries.forEach((f) => {
          const validatorDetail = this.lstValidatorOrigin?.find((i) => i.operator_address === data.validator_address);
          let item = {
            balance: f.balance / NUMBER_CONVERT,
            validator_address: data.validator_address,
            validator_name: validatorDetail?.title,
            jailed: validatorDetail?.jailed,
            image_url: validatorDetail?.image_url,
            validator_identity: validatorDetail?.identity,
            completion_time: f.completion_time,
          };
          let timeConvert = new Date(f.completion_time);
          if (now < timeConvert) {
            this.lstUndelegate.push(item);
          }
        });
      });

      this.lstUndelegate = this.lstUndelegate?.sort((a, b) => {
        return this.compare(a.completion_time, b.completion_time, true);
      });
    }
  }
}
