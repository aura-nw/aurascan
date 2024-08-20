import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contract, parseEther } from 'ethers';
import { MAX_NUMBER_INPUT, NUMBER_2_DIGIT, TIME_OUT_CALL_API } from 'src/app/core/constants/common.constant';
import { DIALOG_STAKE_MODE } from 'src/app/core/constants/validator.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { AccountService } from 'src/app/core/services/account.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { ValidatorService } from 'src/app/core/services/validator.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { parseError } from 'src/app/core/utils/cosmoskit/helpers/errors';
import { stakeAbi } from '../../stakeAbi';
import { TransactionService } from '../../../../core/services/transaction.service';
import * as _ from 'lodash';
import { switchMap } from 'rxjs/internal/operators/switchMap';

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
  stakeContractAddr = this.environmentService.evmChainInfo.stakeContract;

  contract: Contract;

  constructor(
    private walletService: WalletService,
    private modalService: NgbModal,
    private accountService: AccountService,
    private toastr: NgxToastrService,
    private mappingErrorService: MappingErrorService,
    private environmentService: EnvironmentService,
    private validatorService: ValidatorService,
    private transactionService: TransactionService,
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

    let amountCheck = this.validatorService.getMaxAmount(
      this.dataDelegate.availableToken,
      this.dataDelegate.delegableVesting,
    );
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
  async createContract(contractAddr) {
    try {
      const connected = await this.walletService.connectToChain();
      if (!connected) {
        this.isLoading = false;
        this.isHandleStake = false;
        this.toastr.error(`Please switch to ${this.environmentService.evmChainInfo.chain} chain.`);
        return null;
      }

      const signer = await this.walletService.getWalletSigner();
      let contract = new Contract(contractAddr, stakeAbi, signer);

      if (contract) {
        this.contract = contract;

        return this.contract;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  async handleStaking() {
    this.isValidAmount();
    if (!this.isExceedAmount && !this.isValidatorJail && this.amountFormat > 0) {
      this.isLoading = true;

      const account = this.walletService.getCosmosAccountOnly();
      if (!account) {
        return;
      }
      if (account?.cosmosAccount) {
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
      } else {
        const contract = await this.createContract(this.stakeContractAddr);

        if (!contract) {
          return;
        }
        const nameContract = 'delegate';
        const params = [
          account.evmAddress,
          this.currentValidatorDetail?.operator_address,
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

  isValidAmount(): void {
    let amountCheck = this.validatorService.getMaxAmount(
      this.dataDelegate.availableToken,
      this.dataDelegate.delegableVesting,
    );
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

      if (!hash && !evmHash) {
        return;
      }
      if (hash) {
        this.toastr.loading(hash);

        setTimeout(() => {
          this.mappingErrorService.checkDetailTx(hash).then(() => {
            this.reloadData.emit();
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
              next: () => {
                this.reloadData.emit();
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
    this.changeStatus.emit(false);
    this.modalReference?.close();
  }
}
