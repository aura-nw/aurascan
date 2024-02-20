import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  MAX_NUMBER_INPUT,
  NUMBER_2_DIGIT,
  NUMBER_CONVERT,
  TIME_OUT_CALL_API,
} from 'src/app/core/constants/common.constant';
import { DIALOG_STAKE_MODE } from 'src/app/core/constants/validator.enum';
import { SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { AccountService } from 'src/app/core/services/account.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getFee } from 'src/app/core/utils/signing/fee';

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
  maxNumberInput = MAX_NUMBER_INPUT;
  number2Digit = NUMBER_2_DIGIT;

  chainInfo = this.environmentService.chainInfo;
  coinMinimalDenom = this.environmentService.chainInfo.currencies[0].coinMinimalDenom;
  denom = this.environmentService.chainInfo.currencies[0].coinDenom;

  constructor(
    private walletService: WalletService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private toastr: NgxToastrService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.walletService.walletAccount$.subscribe((wallet) => {
      if (wallet) {
        this.dataDelegate = null;
        this.userAddress = wallet.address;
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

  viewPopupDetail(staticDataModal: any) {
    if (!this.dialogOpen) {
      const view = async () => {
        const account = this.walletService.getAccount();
        if (account && account.address) {
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
      this.dataDelegate = { dialogMode: DIALOG_STAKE_MODE.Delegate };
      this.accountService.getAccountDetail(this.userAddress).subscribe(
        (res) => {
          if (res) {
            this.dataDelegate = {
              ...this.dataDelegate,
              delegableVesting: res?.data?.delegable_vesting,
              delegatedToken: res?.data?.delegated,
              availableToken: res?.data?.available,
              stakingToken: res?.data?.stake_reward,
              validatorDetail:
                res?.data?.delegations?.find(
                  (k) => k.validator_address === this.currentValidatorDetail?.operator_address,
                ) || {},
            };
            this.dataDelegate.validatorDetail['amount_staked'] = this.dataDelegate?.validatorDetail?.amount || 0;
            document.getElementById('buttonOpenDialog').click();
          }
        },
        (err) => {
          document.getElementById('buttonOpenDialog').click();
        },
        () => {},
      );
    }
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
      this.isLoading = true;

      const msg = {
        delegatorAddress: this.userAddress,
        validatorAddress: this.currentValidatorDetail?.operator_address,
        amount: {
          amount: (this.amountFormat * Math.pow(10, 6)).toFixed(0),
          denom: this.coinMinimalDenom,
        },
      };

      this.walletService
        .delegateTokens(msg.delegatorAddress, msg.validatorAddress, msg.amount)
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

  checkTxStatusOnchain({ success, error }: { success?: any; error?: { message: string; code: number } }) {
    this.isOpenDialog = false;
    this.dialogOpen = false;

    if (error) {
      const { message, code } = typeof error == 'string' ? { message: error, code: undefined } : error;

      if (code) {
        let errorMessage = this.mappingErrorService.checkMappingError('', code);
        this.toastr.error(errorMessage);
      }

      this.resetData();
    } else {
      const hash = success?.transactionHash;
      this.isLoading = false;

      if (!hash) {
        return;
      }

      this.toastr.loading(hash);

      setTimeout(() => {
        this.mappingErrorService.checkDetailTx(hash).then(() => {
          this.reloadData.emit();
        });
        this.resetData();
      }, TIME_OUT_CALL_API);
    }
  }

  resetData() {
    this.isLoading = false;
    this.isHandleStake = false;
    this.changeStatus.emit(false);
    this.modalReference?.close();
  }
}
