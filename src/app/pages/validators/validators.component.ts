import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { MsgBeginRedelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { Contract, parseEther } from 'ethers';
import * as _ from 'lodash';
import { Subject, Subscription, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  MAX_NUMBER_INPUT,
  NUMBER_2_DIGIT,
  NUM_BLOCK,
  TIMEOUT_ERROR,
  TIME_OUT_CALL_API,
} from 'src/app/core/constants/common.constant';
import { TRANSACTION_TYPE_ENUM } from 'src/app/core/constants/transaction.enum';
import { VOTING_POWER_STATUS } from 'src/app/core/constants/validator.constant';
import { DIALOG_STAKE_MODE, STATUS_VALIDATOR, VOTING_POWER_LEVEL } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { DataDelegateDto, TableTemplate } from 'src/app/core/models/common.model';
import { AccountService } from 'src/app/core/services/account.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { balanceOf, getBalance } from 'src/app/core/utils/common/parsing';
import { parseError } from 'src/app/core/utils/cosmoskit/helpers/errors';
import { stakeAbi } from './stakeAbi';
import { TransactionService } from '../../core/services/transaction.service';

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
  amountFormat = undefined;
  isExceedAmount = false;
  userAddress = '';
  selectedValidator: string;
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
  maxNumberInput = MAX_NUMBER_INPUT;
  timerUnSub: Subscription;
  errorExceedAmount = false;
  isHandleStake = false;
  isLoading = false;
  isClaimRewardLoading = false;
  _routerSubscription: Subscription;
  destroyed$ = new Subject<void>();
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));

  pageYOffset = 0;
  scrolling = false;
  numBlock = NUM_BLOCK.toLocaleString('en-US', { minimumFractionDigits: 0 });
  staking_APR = 0;
  maxPercentPower = 0;
  typeActive = 'BOND_STATUS_BONDED';
  countProposal = 0;
  dataUserDelegate;
  loadingData = true;
  errTxt: string;
  contract: Contract;

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    this.pageYOffset = window.pageYOffset;
  }
  number2Digit = NUMBER_2_DIGIT;

  chainInfo = this.environmentService.chainInfo;
  denom = this.chainInfo.currencies[0].coinDenom;
  coinMinimalDenom = this.chainInfo.currencies[0].coinMinimalDenom;
  stakeContractAddr = this.environmentService.evmChainInfo.stakeContract;
  claimContractAddr = this.environmentService.evmChainInfo.claimContract;

  constructor(
    private validatorService: ValidatorService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private mappingErrorService: MappingErrorService,
    private router: Router,
    private layout: BreakpointObserver,
    private scroll: ViewportScroller,
    private environmentService: EnvironmentService,
    private proposalService: ProposalService,
    private transactionService: TransactionService,
  ) {}

  async ngOnInit() {
    this.getCountProposal();
    this.walletService.walletAccount$.subscribe((wallet) => {
      if (wallet) {
        this.dataDelegate = null;
        this.lstUndelegate = null;
        this.userAddress = wallet.address;
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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.timerUnSub) {
      this.timerUnSub.unsubscribe();
    }
  }

  createContract(contractAddr, evmAccount) {
    if (this.contract) {
      return this.contract;
    }

    try {
      let contract = new Contract(contractAddr, stakeAbi, evmAccount);

      if (contract) {
        this.contract = contract;

        return this.contract;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  getList(): void {
    this.validatorService.getListValidator(null).subscribe({
      next: (res) => {
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
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loadingData = false;
      },
      complete: () => {
        this.loadingData = false;
      },
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
      if (account && account.address) {
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

        //stakingToken
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
      this.accountService.getAccountDetail(this.userAddress).subscribe({
        next: (dataWallet) => {
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
        error: (error) => {
          setTimeout(() => {
            this.getDataWallet();
            this.getList();
          }, halftime);
        },
      });
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

  async handleDelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      this.isLoading = true;

      const account = this.walletService.getCosmosAccountOnly();
      if (!account) {
        return;
      }
      if (account?.cosmosAccount) {
        const msg = {
          delegatorAddress: this.userAddress,
          validatorAddress: this.validatorDetail.validator_address,
          amount: {
            amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
            denom: this.coinMinimalDenom,
          },
        };

        this.walletService
          .delegateTokens(msg.delegatorAddress, msg.validatorAddress, msg.amount, 'auto')
          .then((broadcastResult) => {
            let error = undefined;
            if (broadcastResult?.code != 0) {
              error = broadcastResult;
            }

            this.checkTxStatusOnchain({ success: broadcastResult, error });
          })
          .catch((error) => {
            console.log('🐛 error: ', error);
            this.checkTxStatusOnchain({ error });
          });
      } else {
        const contract = this.createContract(this.stakeContractAddr, account.evmAccount);

        if (!contract) {
          return;
        }
        const nameContract = 'delegate';
        const params = [
          account.evmAddress,
          this.validatorDetail.validator_address,
          (this.amountFormat * Math.pow(10, 18)).toFixed(0),
        ];
        const x = await contract[nameContract]?.estimateGas(...params).catch((e) => e);

        contract[nameContract]?.(...params, {
          gasLimit: Number(x) || 250_000,
          gasPrice: 1_000_0000,
          value: parseEther('0'),
        })
          .then((res) => {
            let error = undefined;
            this.checkTxStatusOnchain({ success: res, error });
          })
          .catch((error) => {
            console.log('🐛 error: ', error);
            this.checkTxStatusOnchain({ error });
          });
      }
    }
  }

  async handleClaim() {
    if (Number(this.dataDelegate.stakingToken) > 0) {
      try {
        this.isClaimRewardLoading = true;
        this.isLoading = true;

        const account = this.walletService.getCosmosAccountOnly();
        if (!account) {
          return;
        }
        if (account?.cosmosAccount) {
          const msg = this.lstValidatorData.map((vd) => ({
            typeUrl: TRANSACTION_TYPE_ENUM.GetReward,
            value: MsgWithdrawDelegatorReward.fromPartial({
              validatorAddress: vd.validator_address,
              delegatorAddress: this.userAddress,
            }),
          }));

          const revokeMultiplier = 1.7; // revoke multiplier - NOT FOR ALL
          const fee = await this.walletService.estimateFee(msg, 'cosmwasm', '', revokeMultiplier);

          this.walletService
            .signAndBroadcast(this.userAddress, msg, fee || 'auto')
            .then((broadcastResult) => {
              let error = undefined;
              if (broadcastResult?.code != 0) {
                error = broadcastResult;
              }

              this.checkTxStatusOnchain({ success: broadcastResult, error });
            })
            .catch((error) => {
              this.checkTxStatusOnchain({ error });
            });
        } else {
          const contract = this.createContract(this.claimContractAddr, account.evmAccount);

          if (!contract) {
            return;
          }
          const nameContract = 'claimRewards';

          const params = [account.evmAddress, this.dataSource?.data.length.toString()];
          const x = await contract[nameContract]?.estimateGas(...params).catch((e) => e);
          contract[nameContract]?.(...params, {
            gasLimit: Number(x) || 250_000,
            gasPrice: 1_000_0000,
            value: parseEther('0'),
          })
            .then((res) => {
              let error = undefined;
              this.checkTxStatusOnchain({ success: res, error });
            })
            .catch((error) => {
              this.checkTxStatusOnchain({ error });
            });
        }
      } catch (error) {
        console.error('Claim Error: ', error);
      }
    }
  }

  async handleUndelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      this.isLoading = true;

      const account = this.walletService.getCosmosAccountOnly();
      if (!account) {
        return;
      }
      if (account?.cosmosAccount) {
        const amount = {
          amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
          denom: this.coinMinimalDenom,
        };

        this.walletService
          .undelegateTokens(this.userAddress, this.validatorDetail.validator_address, amount)
          .then((broadcastResult) => {
            let error = undefined;
            if (broadcastResult?.code != 0) {
              error = broadcastResult;
            }

            this.checkTxStatusOnchain({ success: broadcastResult, error });
          })
          .catch((error) => {
            this.checkTxStatusOnchain({ error });
          });
      } else {
        const contract = this.createContract(this.stakeContractAddr, account.evmAccount);

        if (!contract) {
          return;
        }
        const nameContract = 'undelegate';
        const params = [
          account.evmAddress,
          this.validatorDetail.validator_address,
          (this.amountFormat * Math.pow(10, 18)).toFixed(0),
        ];
        const x = await contract[nameContract]?.estimateGas(...params).catch((e) => e);

        contract[nameContract]?.(...params, {
          gasLimit: Number(x) || 250_000,
          gasPrice: 1_000_0000,
          value: parseEther('0'),
        })
          .then((res) => {
            let error = undefined;
            this.checkTxStatusOnchain({ success: res, error });
          })
          .catch((error) => {
            this.checkTxStatusOnchain({ error });
          });
      }
    }
  }

  async handleRedelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      this.isLoading = true;

      const account = this.walletService.getCosmosAccountOnly();
      if (!account) {
        return;
      }
      if (account?.cosmosAccount) {
        const msg = {
          typeUrl: TRANSACTION_TYPE_ENUM.Redelegate,
          value: MsgBeginRedelegate.fromPartial({
            delegatorAddress: this.userAddress,
            validatorSrcAddress: this.validatorDetail.validator_address,
            validatorDstAddress: this.selectedValidator,
            amount: {
              amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
              denom: this.coinMinimalDenom,
            },
          }),
        };

        this.walletService
          .signAndBroadcast(this.userAddress, [msg])
          .then((broadcastResult) => {
            let error = undefined;
            if (broadcastResult?.code != 0) {
              error = broadcastResult;
            }

            this.checkTxStatusOnchain({ success: broadcastResult, error });
          })
          .catch((error) => {
            this.checkTxStatusOnchain({ error });
          });
      } else {
        const contract = this.createContract(this.stakeContractAddr, account.evmAccount);

        if (!contract) {
          return;
        }
        const nameContract = 'redelegate';
        const params = [
          account.evmAddress,
          this.validatorDetail.validator_address,
          this.selectedValidator,
          (this.amountFormat * Math.pow(10, 18)).toFixed(0),
        ];
        const x = await contract[nameContract]?.estimateGas(...params).catch((e) => e);

        contract[nameContract]?.(...params, {
          gasLimit: Number(x) || 250_000,
          gasPrice: 1_000_0000,
          value: parseEther('0'),
        })
          .then((res) => {
            let error = undefined;
            this.checkTxStatusOnchain({ success: res, error });
          })
          .catch((error) => {
            this.checkTxStatusOnchain({ error });
          });
      }
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
    let amount = this.validatorService.getMaxAmount(
      this.dataDelegate.availableToken,
      this.dataDelegate.delegableVesting,
    );
    return amount;
  }

  setCommissionTitle(label: string) {
    this.commissionLabel = label;
  }

  checkTxStatusOnchain({ success, error }: { success?: any; error?: { message: string; code: number } | string }) {
    if (error) {
      const { message, code } = typeof error == 'string' ? { message: error, code: undefined } : parseError(error);
      let errorMessage = message;
      if (code > 0) {
        errorMessage = this.mappingErrorService.checkMappingError(message, code);
      }
      this.toastr.error(errorMessage ?? message ?? 'Unknown Error');
      this.resetData();
    } else {
      const hash = success?.transactionHash;
      const evmHash = success?.hash;
      this.isLoading = false;
      this.modalReference?.close();

      if (!hash && !evmHash) {
        return;
      }
      if (hash) {
        this.toastr.loading(hash);

        setTimeout(() => {
          this.mappingErrorService.checkDetailTx(hash).then(() => {
            this.getList();
            this.getDataWallet();
          });
          this.resetData();
        }, TIME_OUT_CALL_API);
      } else {
        this.toastr.loading(evmHash);

        setTimeout(() => {
          const payload = {
            limit: 1,
            hash: evmHash,
          };
          this.transactionService
            .queryTransactionByEvmHash(payload)
            .pipe(
              switchMap((response) => {
                const txData = _.get(response, 'transaction[0]');
                return this.mappingErrorService.checkDetailTx(txData?.hash);
              }),
            )
            .subscribe({
              next: (res) => {
                this.getList();
                this.getDataWallet();
              },
              error: (e) => {},
              complete: () => {},
            });

          this.resetData();
        }, TIME_OUT_CALL_API);
      }
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
            balance: getBalance(f.balance, this.environmentService.coinDecimals),
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
