import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { NUMBER_CONVERT, TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { CodeTransaction } from 'src/app/core/constants/transaction.enum';
import { DIALOG_STAKE_MODE } from 'src/app/core/constants/validator.enum';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { AccountService } from 'src/app/core/services/account.service';
import { CommonService } from 'src/app/core/services/common.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getFee } from 'src/app/core/utils/signing/fee';
import { createSignBroadcast } from 'src/app/core/utils/signing/transaction-manager';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-delegate-item',
  templateUrl: './delegate-item.component.html',
  styleUrls: ['./delegate-item.component.scss'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class DelegateItemComponent implements OnInit {
  @Input() currentValidatorDetail: any;
  @Input() isOpenDialog: boolean;
  @Output() changeStatus = new EventEmitter();
  @Output() reloadData = new EventEmitter();

  modalReference: any;
  isExceedAmount = false;
  amountFormat = null;
  errorExceedAmount = false;
  dataDelegate = null;
  userAddress = null;
  isHandleStake = false;
  isLoading = false;
  totalDelegator = 0;
  dialogOpen = false;
  isValidatorJail = false;

  chainInfo = this.environmentService.configValue.chain_info;
  coinMinimalDenom = this.environmentService.configValue.chain_info.currencies[0].coinMinimalDenom;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;

  constructor(
    public globals: Globals,
    public commonService: CommonService,
    private validatorService: ValidatorService,
    private walletService: WalletService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private toastr: NgxToastrService,
    private transactionService: TransactionService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.dataDelegate = null;
        this.userAddress = wallet.bech32Address;
      } else {
        this.userAddress = null;
      }
    });
  }

  onClick(event) {
    //check click out side dialog
    if (event.target.localName === 'ngb-modal-window' && this.isOpenDialog) {
      this.closeDialog();
    }
  }

  ngOnChanges(): void {
    if (this.isOpenDialog) {
      this.getDataWallet();
    }
  }

  getValidatorAvatar(validatorAddress: string): string {
    return this.validatorService.getValidatorAvatar(validatorAddress);
  }

  viewPopupDetail(staticDataModal: any) {
    if (!this.dialogOpen) {
      const view = async () => {
        const account = this.walletService.getAccount();
        if (account && account.bech32Address) {
          this.amountFormat = null;
          this.resetCheck();
          this.modalReference = this.modalService.open(staticDataModal, {
            keyboard: false,
            centered: true,
            size: 'lg',
            windowClass: 'modal-holder validator-modal',
          });
          this.dialogOpen = true;
        }
      };
      view();
    }
  }

  //Get data for wallet info and list staking
  getDataWallet() {
    if (this.userAddress) {
      this.accountService.getAccountDetail(this.userAddress).subscribe((res) => {
        if (res) {
          this.getListDelegators(this.currentValidatorDetail?.operator_address);

          this.dataDelegate = {
            ...this.dataDelegate,
            delegableVesting: res?.data?.delegable_vesting,
            delegatedToken: res?.data?.delegated,
            availableToken: res?.data?.available,
            stakingToken: res?.data?.stake_reward,
            dialogMode: DIALOG_STAKE_MODE.Delegate,
            validatorDetail:
              res?.data?.delegations.find(
                (k) => k.validator_address === this.currentValidatorDetail?.operator_address,
              ) || {},
          };
          this.dataDelegate.validatorDetail['amount_staked'] = this.dataDelegate?.validatorDetail?.amount || 0;

          document.getElementById('buttonOpenDialog').click();
        }
      });
    }
  }

  async getListDelegators(address) {
    const res = await this.validatorService.delegators(5, 0, address);
    this.totalDelegator = res?.data?.pagination?.total || 0;
  }

  resetCheck() {
    this.isExceedAmount = false;
    this.isValidatorJail = false;
    this.errorExceedAmount = false;
  }

  getMaxToken(): void {
    //check amout for high fee
    this.resetCheck();
    let amountCheck = (
      Number(this.dataDelegate.availableToken) +
      Number(this.dataDelegate.delegableVesting) -
      (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT
    ).toFixed(6);
    if (Number(amountCheck) < 0) {
      this.isExceedAmount = true;
      this.errorExceedAmount = true;
      amountCheck = '0';
    }
    this.amountFormat = amountCheck || 0;
  }

  closeDialog() {
    if (this.modalReference) {
      this.dialogOpen = false;
      this.changeStatus.emit(false);
      this.modalReference.close('Close click');
    }
  }

  handleStaking() {
    this.isValidAmount();
    if (!this.isExceedAmount && !this.isValidatorJail && this.amountFormat > 0) {
      const executeStaking = async () => {
        this.isLoading = true;
        const { hash, error } = await this.walletService.signAndBroadcast({
          messageType: SIGNING_MESSAGE_TYPES.STAKE,
          message: {
            to: [this.currentValidatorDetail?.operator_address],
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

        this.isOpenDialog = false;
        this.dialogOpen = false;
        this.changeStatus.emit(false);
        this.checkStatusExecuteBlock(hash, error, '');
      };

      executeStaking();
    }
  }

  isValidAmount(): void {
    let amountCheck;
    amountCheck = (
      +this.dataDelegate.availableToken +
        +this.dataDelegate.delegableVesting -
        (Number(getFee(SIGNING_MESSAGE_TYPES.STAKE)) * this.chainInfo.gasPriceStep.high) / NUMBER_CONVERT || 0
    ).toFixed(6);
    this.isExceedAmount = false;
    this.isValidatorJail = false;
    if (this.currentValidatorDetail?.jailed !== 0) {
      this.isValidatorJail = true;
      return;
    } else if (this.amountFormat > +amountCheck) {
      this.isExceedAmount = true;
      return;
    } else {
      this.isHandleStake = true;
    }
  }

  checkStatusExecuteBlock(hash, error, msg) {
    this.checkHashAction(hash);
    if (error) {
      if (error != 'Request rejected') {
        this.toastr.error(error);
      }
      this.resetData();
    } else {
      setTimeout(() => {
        this.checkDetailTx(hash, msg);
        this.resetData();
      }, TIME_OUT_CALL_API);
    }
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

  resetData() {
    this.isLoading = false;
    this.modalReference?.close();
    this.isHandleStake = false;
    this.changeStatus.emit(false);
  }

  async checkDetailTx(id, message) {
    const res = await this.transactionService.txsDetailLcd(id);
    let numberCode = res?.data?.tx_response?.code;
    message = res?.data?.tx_response?.raw_log || message;
    message = this.mappingErrorService.checkMappingError(message, numberCode);
    if (numberCode !== undefined) {
      if (!!!numberCode && numberCode === CodeTransaction.Success) {
        setTimeout(() => {
          // location.reload();
          this.reloadData.emit();
        }, TIME_OUT_CALL_API);
        this.toastr.success(message);
      } else {
        this.toastr.error(message);
      }
    }
  }
}
