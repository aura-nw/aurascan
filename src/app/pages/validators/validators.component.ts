import { Component, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from '../../../app/core/services/account.service';
import { NUMBER_CONVERT, PAGE_SIZE_OPTIONS } from '../../../app/core/constants/common.constant';
import { CommonDataDto, DataDelegateDto, ResponseDto, TableTemplate } from '../../../app/core/models/common.model';
import { CommonService } from '../../../app/core/services/common.service';
import { ValidatorService } from '../../../app/core/services/validator.service';
import { Globals } from '../../../app/global/global';
import { WalletService } from '../../../app/core/services/wallet.service';
import {
  ChainsInfo,
  SIGNING_MESSAGE_TYPES,
} from '../../../app/core/constants/wallet.constant';
import { createSignBroadcast } from '../../core/utils/signing/transaction-manager';
import { TYPE_STAKING } from '../../../app/core/constants/validator.constant';
import { DIALOG_STAKE_MODE, STATUS_VALIDATOR } from '../../../app/core/constants/validator.enum';
import { async, forkJoin } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NgxToastrService } from '../../../app/core/services/ngx-toastr.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { formatDistanceToNowStrict } from 'date-fns';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
})
export class ValidatorsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'rank', headerCellDef: 'Rank' },
    { matColumnDef: 'title', headerCellDef: 'Validator' },
    { matColumnDef: 'power', headerCellDef: 'Voting Power' },
    { matColumnDef: 'commission', headerCellDef: 'Commission' },
    { matColumnDef: 'participation', headerCellDef: 'Participation' },
    { matColumnDef: 'up_time', headerCellDef: 'Uptime' },
    // { matColumnDef: 'percent_power', headerCellDef: 'Cumulative Share %' },
    { matColumnDef: 'action', headerCellDef: '' }
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any>;
  dataSourceBk: MatTableDataSource<any>;
  length;
  pageIndex = 0;

  templatesWallet: Array<TableTemplate> = [
    { matColumnDef: 'validator_name', headerCellDef: 'Name' },
    { matColumnDef: 'amount_staked', headerCellDef: 'Amount Staked' },
    { matColumnDef: 'pending_reward', headerCellDef: 'Pending Reward' },
    { matColumnDef: 'action', headerCellDef: '' }
  ];
  displayedColumnsWallet: string[] = this.templatesWallet.map((dta) => dta.matColumnDef);
  dataSourceWallet: MatTableDataSource<any>;
  lengthWallet = 0;
  
  pageSizeOptions = PAGE_SIZE_OPTIONS;
  isActive = true;
  textSearch = '';
  rawData;
  sortedData;
  dataHeader = new CommonDataDto();
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  dataModal;
  clicked = false;
  totalDelegator = 0;
  claimReward = 0;
  amountFormat = null;
  isExceedAmount = false;
  userAddress = '';
  validatorAddress = [];
  selectedValidator;
  listTypeStake = TYPE_STAKING;
  searchNullData = false;
  listStakingValidator = [];
  validatorDetail = '';
  statusValidator = STATUS_VALIDATOR;
  typeValidator = STATUS_VALIDATOR.Active;
  dataDelegate = new DataDelegateDto();
  dialogMode = DIALOG_STAKE_MODE;
  isOpenStaking = false;
  modalReference: any;
  currentValidatorDialog;
  lstValidator = [];
  lstUndelegate = [];
  numberCode = 0;

  constructor(
    private validatorService: ValidatorService,
    public globals: Globals,
    private modalService: NgbModal,
    private accountService: AccountService,
    private commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Validators' }, { label: 'List', active: true }];

    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
        this.getDataWallet();
      }
    });
    // this.userAddress = 'aura1992zh99p5qdcgfs27hnysgy2sr2vupu39a72r5';
    this.getList();

    setInterval(() => {
      this.getList();
      this.getDataWallet();
    }, 10000);
  }

  ngAfterViewInit(): void {
  }

  getList(): void {
    this.validatorService.validators().subscribe((res: ResponseDto) => {
      this.rawData = res.data;
      res.data.forEach((val) => {
        if (val.target_count > 0 && ((val.vote_count / val.target_count) <= 0.5)) {
          val.isPartiDown = true;
        }
        val.participation = val.vote_count + '/ ' + val.target_count;
      });

      let dataFilter = res.data.filter((event) => (this.typeValidator === this.statusValidator.Active) ? 
            event.status === this.statusValidator.Active : event.status !== this.statusValidator.Active);
      //sort and calculator cumulative
      // let dataSort = this.calculatorCumulative(dataFilter);
      this.dataSource = new MatTableDataSource(dataFilter);
      this.dataSourceBk = this.dataSource;
      this.dataSource.sort = this.sort;
      this.searchValidator();
    });
  }

  changeType(type): void {
    this.typeValidator = type;
    let data = this.rawData.filter((event) => (type === this.statusValidator.Active) ? 
              event.status === this.statusValidator.Active : event.status !== this.statusValidator.Active);
    this.dataSource = new MatTableDataSource(data);
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

    let dataFilter = this.sortedData.filter((event) => (this.typeValidator === this.statusValidator.Active) ? 
                event.status === this.statusValidator.Active : event.status !== this.statusValidator.Active)
    //sort and calculator cumulative
    // let dataSort = this.calculatorCumulative(dataFilter);
    this.dataSource = new MatTableDataSource(dataFilter);
    this.dataSource.sort = this.sort;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // calculatorCumulative(dataFilter) {
  //   for (const key in dataFilter) {
  //     const dataOrigin = dataFilter[key];
  //     const dataBefore = dataFilter[parseInt(key) - 1];
  //     if (dataOrigin?.title) {
  //       if (parseInt(key) === 0) {
  //         dataOrigin.cumulative_share_before = '0.00';
  //         dataOrigin.cumulative_share = dataOrigin.percent_power;
  //         dataOrigin.cumulative_share_after = dataOrigin.percent_power;
  //       } else {
  //         dataOrigin.cumulative_share_before = dataBefore?.cumulative_share_after || 0;
  //         dataOrigin.cumulative_share = dataOrigin?.percent_power;
  //         const cumulative = parseFloat(dataOrigin?.cumulative_share_before) + parseFloat(dataOrigin?.percent_power);
  //         dataOrigin.cumulative_share_after = cumulative.toFixed(2);
  //       }
  //       dataFilter.cumulative_share_before = dataOrigin.cumulative_share_before;
  //       dataFilter.cumulative_share = dataOrigin.cumulative_share;
  //       dataFilter.cumulative_share_after = dataOrigin.cumulative_share_after;
  //     }
  //   }
  //   return dataFilter;
  // }

  searchValidator(): void {
    this.searchNullData = false;
    let data;
    if (this.textSearch.length > 0 || this.typeValidator !== STATUS_VALIDATOR.Active) {
      data = this.dataSourceBk.data.filter (
        (f) =>
          f.title.toLowerCase().indexOf(this.textSearch.toLowerCase().trim()) > -1
      );
      this.dataSource = this.dataSourceBk;
      this.dataSource = new MatTableDataSource(data);
      if (data === undefined || data?.length === 0) {
        this.searchNullData = true;
      }
    } else {
      this.dataSource = this.dataSourceBk;
    }
  }

  viewPopupDetail(staticDataModal: any, address: string, dialogMode = '', isOpenStaking = false) {
    this.currentValidatorDialog = address;
    const view = async () => {
      this.walletService.connectKeplr(this.walletService.chainId);

      this.walletService.wallet$.pipe(takeWhile((e) => !(e && e?.bech32Address), true)).subscribe((wallet) => {
        if (wallet && wallet.bech32Address) {
          this.clicked = true;
          this.amountFormat = null;
          this.getValidatorDetail(address, staticDataModal);
          this.getListRedelegate(this.userAddress, address);
        }
      });
    };
    view();
    this.isOpenStaking = isOpenStaking;
    this.dataDelegate.dialogMode = dialogMode;
  }

  getValidatorDetail(address, modal): void {
    this.validatorService.validatorsDetail(address).subscribe(
      (res) => {
        this.dataModal = res.data;
        this.validatorDetail = this.listStakingValidator?.find((f) => f.validator_address === address);
        this.dataDelegate.validatorDetail = this.validatorDetail;
        this.getListDelegators(address);

        this.clicked = false;
        this.isExceedAmount = false;
        this.modalReference = this.modalService.open(modal, {
          keyboard: false,
          centered: true,
          windowClass: 'modal-holder',
        });
      },
      (error) => {},
    );
  }

  getListRedelegate(userAddress, operatorAddress): void {
    this.validatorService.validatorsListRedelegate(userAddress, operatorAddress).subscribe(
      (res) => {
        this.lstValidator = res.data;
        // res.forEach(f => {
        //   let isStaking = (f.staking_address === this.userAddress) ? true : false;
        //   this.lstValidator.push(f.title, f.commission, isStaking);
        // });
        
        // this.dataModal = res.data;
        // this.validatorDetail = this.listStakingValidator?.find((f) => f.validator_address === address);
        // this.dataDelegate.validatorDetail = this.validatorDetail;
        // this.getListDelegators(address);
      },
      (error) => {},
    );
  }

  //Get data for wallet info and list staking
  getDataWallet() {
    if (this.userAddress) {
      forkJoin({
        dataWallet: this.accountService.getAccoutDetail(this.userAddress),
        dataListDelegator: this.validatorService.validatorsDetailWallet(this.userAddress),
        dataListUndelegator: this.validatorService.validatorsListUndelegateWallet(this.userAddress)
      }).subscribe((res) => {
        if (res.dataWallet) {
          this.dataDelegate.delegatedToken = res?.dataWallet?.data?.delegated;
          this.dataDelegate.availableToken = res?.dataWallet?.data?.available;
          this.dataDelegate.stakingToken = res?.dataWallet?.data?.stake_reward;
        }

        if (res.dataListDelegator) {
          this.listStakingValidator = res.dataListDelegator?.data?.delegations;
          if (this.currentValidatorDialog) {
            this.dataDelegate.validatorDetail = this.listStakingValidator?.find((f) => f.validator_address === this.currentValidatorDialog);
          }
          if (res?.dataListDelegator?.data?.delegations.length > 0) {
            res?.dataListDelegator?.data?.delegations.forEach((f) => {
              f.amount_staked = f.amount_staked / NUMBER_CONVERT;
              f.pending_reward = f.pending_reward / NUMBER_CONVERT;
            });
            this.dataSourceWallet = new MatTableDataSource(res?.dataListDelegator.data?.delegations);
            this.lengthWallet = res?.dataListDelegator.data?.delegations?.length;
          }
        }

        if (res.dataListUndelegator) {
          this.lstUndelegate = [];
          res.dataListUndelegator.data.forEach(data => {
            data.entries.forEach(f => {
              f.balance = f.balance / NUMBER_CONVERT;
              f.validator_address = data.validator_address;
              f.validator_name = data.validator_name;
              this.lstUndelegate.push(f);
            });
          });

          this.lstUndelegate = this.lstUndelegate.sort((a, b) => {
            return this.compare(a.completion_time, b.completion_time, true);
          });
        }
      });
    }
  }

  getListDelegators(address): void {
    //get total delegator
    this.commonService.delegators(5, 0, address).subscribe((res) => {
      this.totalDelegator = res?.meta?.count;
    });
  }

  checkAmountStaking(): void {
    let amountCheck;
    if (this.dataDelegate.dialogMode === this.dialogMode.Delegate){
      amountCheck = this.dataDelegate.availableToken;
    } else if (this.dataDelegate.dialogMode === this.dialogMode.Redelegate || this.dataDelegate.dialogMode === this.dialogMode.Undelegate){
      amountCheck = this.dataDelegate.validatorDetail.amount_staked;
    }
    this.isExceedAmount = false;
    if (this.amountFormat > amountCheck) {
      this.isExceedAmount = true;
    }
  }

  resetCheck() {
    this.isExceedAmount = false;
  }

  handleStaking() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const excuteStaking = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: [this.dataModal.operator_address],
            amount: {
              amount: Number(this.amountFormat) * Math.pow(10, 6),
              denom: 'uaura',
            },
          },
          senderAddress: this.userAddress,
          network: ChainsInfo[this.walletService.chainId],
          signingType: 'keplr',
          chainId: this.walletService.chainId,
        });

        this.checkStatuExcuteBlock(hash, error, 'Error Delegate');
      };
      
      excuteStaking();
    }
  }

  handleClaim() {
    if (Number(this.dataDelegate.stakingToken) > 0) {
      const excuteClaim = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.CLAIM_REWARDS,
          message: {
            from: this.listStakingValidator,
          },
          senderAddress: this.userAddress,
          network: ChainsInfo[this.walletService.chainId],
          signingType: 'keplr',
          chainId: this.walletService.chainId,
        });

        this.checkStatuExcuteBlock(hash, error, 'Error Get Reward');
      };
      
      excuteClaim();
    }
  }

  handleUndelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const excuteUnStaking = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.UNSTAKE,
          message: {
            from: [this.dataModal.operator_address],
            amount: {
              amount: Number(this.amountFormat) * Math.pow(10, 6),
              denom: 'uaura',
            },
          },
          senderAddress: this.userAddress,
          network: ChainsInfo[this.walletService.chainId],
          signingType: 'keplr',
          chainId: this.walletService.chainId,
        });

        this.checkStatuExcuteBlock(hash, error, 'Error Undelegate');
      };
      
      excuteUnStaking();
    }
  }

  handleRedelegate() {
    this.checkAmountStaking();
    if (!this.isExceedAmount && this.amountFormat > 0) {
      const excuteReStaking = async () => {
        const { hash, error } = await createSignBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.RESTAKE,
          message: {
            src_address: this.dataModal.operator_address,
            to_address: this.selectedValidator,
            amount: {
              amount: Number(this.amountFormat) * Math.pow(10, 6),
              denom: 'uaura',
            },
          },
          senderAddress: this.userAddress,
          network: ChainsInfo[this.walletService.chainId],
          signingType: 'keplr',
          chainId: this.walletService.chainId,
        });

        this.checkStatuExcuteBlock(hash, error, 'Error Redelegate');
      };
      
      excuteReStaking();
    }
  }

  closeDialog(modal) {
    modal.close('Close click');
  }

  changeTypePopup(type){
    this.isExceedAmount = false;
    this.amountFormat = null;
    this.dataDelegate.dialogMode = type;
  }

  getMaxToken(type): void{
    if (type === this.dialogMode.Delegate) {
      this.amountFormat = this.dataDelegate.availableToken;
    } else if (type === this.dialogMode.Undelegate) {
      this.amountFormat = this.dataDelegate.validatorDetail.amount_staked;
    } else if (type === this.dialogMode.Redelegate) {
      this.amountFormat = this.dataDelegate.availableToken;
    }
  }

  checkStatuExcuteBlock(hash, error, msg) {
    this.modalReference.close();
    if (error) {
      this.toastr.error(msg);
    } else {
      setTimeout(() => {
        this.checkDetailTx(hash, msg);
      }, 3000);
    }
  }
    
  checkDetailTx(id, message) {
    this.transactionService.txsDetail(id).subscribe(
      (res: ResponseDto) => {
        let numberCode = res?.data?.code;
        if (numberCode !== CodeTransaction.Success) {
          message = res?.data?.raw_log || message;
          this.toastr.error(message);
        } else {
          this.getDataWallet();
        }
      },
      (error) => {
      },
    );
  }

  getDateValue(time) {
    if (time) {
      try {
        return [
          formatDistanceToNowStrict(new Date(time).getTime()),
        ];
      } catch (e) {
        return [time, ''];
      }
    } else {
      return ['-', ''];
    }
  }
}
