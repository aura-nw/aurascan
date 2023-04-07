import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { FeeGrantService } from 'src/app/core/services/feegrant.service';
import { MappingErrorService } from 'src/app/core/services/mapping-error.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { PopupNoticeComponent } from '../popup-notice/popup-notice.component';
import { PopupRevokeComponent } from '../popup-revoke/popup-revoke.component';

@Component({
  selector: 'app-popup-add-grant',
  templateUrl: './popup-add-grant.component.html',
  styleUrls: ['./popup-add-grant.component.scss'],
})
export class PopupAddGrantComponent implements OnInit {
  grantForm;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  periodShow = false;
  allContractAllowActive = false;
  currDate;
  errorSpendLimit = false;
  isInvalidAddress = false;
  isInvalidPeriod = false;
  formValid = false;
  isSubmit = false;
  isRevoking = false;
  dayConvert = 24 * 60 * 60;
  prefixAdd = this.environmentService.configValue.chain_info.bech32Config.bech32PrefixAccAddr;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<PopupAddGrantComponent>,
    private fb: FormBuilder,
    public environmentService: EnvironmentService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    private feeGrantService: FeeGrantService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private mappingErrorService: MappingErrorService,
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.initLayout();
  }

  initLayout() {
    // override cdk-overlay-container z-index
    const overlay = document.getElementsByClassName('cdk-overlay-container');
    if (overlay) {
      overlay[0].classList.add('cdk-overlay-container--grant');
    }
    // validator min date
    this.currDate = new Date();
    this.currDate.setDate(this.currDate.getDate() + 1);
  }

  formInit() {
    this.grantForm = this.fb.group({
      grantee_address: ['', [Validators.required]],
      amount: ['', [Validators.maxLength(200)]],
      expiration_time: [''],
      period_amount: [''],
      period_day: [''],
      isInstantiate: false,
      isExecute: false,
      execute_contract: this.fb.array([]),
    });
    this.addContracts();
  }

  get contracts(): FormArray {
    return this.grantForm.get('execute_contract') as FormArray;
  }

  newContract(): FormGroup {
    return this.fb.group({
      address: ['', { validators: [Validators.required] }],
    });
  }

  addContracts() {
    this.contracts.push(this.newContract());
  }

  removeContract(i: number) {
    this.contracts.removeAt(i);
  }

  getMaxToken(controlName: string) {
    this.grantForm.controls[controlName].setValue(this.grantForm.controls['amount']?.value);
    this.errorSpendLimit = false;
  }

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  changePeriodStage(stage: boolean) {
    this.periodShow = stage;
    if (this.periodShow) {
      this.grantForm.controls['period_amount'].setValidators([Validators.required]);
      this.grantForm.controls['period_day'].setValidators([Validators.required]);
    }
    this.checkFormValid();
  }

  changeContractsActive(isAll: boolean) {
    this.allContractAllowActive = isAll;
  }

  async onSubmit() {
    this.isSubmit = true;
    const check = this.checkFormValid();
    if (!check) {
      return;
    }

    const granter = this.walletService.wallet?.bech32Address;
    const {
      grantee_address,
      expiration_time,
      period_amount,
      period_day,
      amount,
      isInstantiate,
      isExecute,
      execute_contract,
    } = this.grantForm.value;

    if (granter && grantee_address) {
      const req = await this.feeGrantService.checkAddressValid(granter, grantee_address);
      this.isRevoking = false;
      if (req.data?.data?.grants?.length > 0) {
        this.isRevoking = true;
        this.showNotice(grantee_address, granter);
        return;
      }
    }

    const timeEndDate = moment(expiration_time)?.toDate()?.setHours(23, 59, 59);
    const executeAddGrant = async () => {
      const { hash, error } = await this.walletService.signAndBroadcast({
        messageType:
          isInstantiate || isExecute
            ? SIGNING_MESSAGE_TYPES.GRANT_MSG_ALLOWANCE
            : period_amount && this.periodShow
            ? SIGNING_MESSAGE_TYPES.GRANT_PERIODIC_ALLOWANCE
            : SIGNING_MESSAGE_TYPES.GRANT_BASIC_ALLOWANCE,
        message: {
          granter,
          grantee: grantee_address?.trim(),
          spendLimit: amount,
          expiration: expiration_time ? timeEndDate : null,
          period: period_day ? period_day * this.dayConvert : undefined,
          periodSpendLimit: period_amount,
          isPeriodic: this.periodShow,
          isInstantiate: isInstantiate,
          isExecute: isExecute,
          executeContract: execute_contract,
        },
        senderAddress: granter,
        network: this.environmentService.configValue.chain_info,
        signingType: ESigningType.Keplr,
        chainId: this.walletService.chainId,
      });

      if (hash) {
        this.closeDialog(hash);
      } else {
        if (error != 'Request rejected') {
          let errorMessage = this.mappingErrorService.checkMappingError('', error);
          this.toastr.error(errorMessage);
        }
      }
    };

    executeAddGrant();
  }

  addClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.add('border-white');
  }

  removeClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.remove('border-white');
  }

  checkFormValid(): boolean {
    const granter = this.walletService.wallet?.bech32Address;
    const { grantee_address, expiration_time, period_amount, period_day, amount, isExecute, execute_contract } =
      this.grantForm.value;

    this.formValid = false;
    this.isInvalidAddress = false;
    if (grantee_address?.length > 0) {
      if (
        this.isSubmit &&
        !(grantee_address?.length >= LENGTH_CHARACTER.ADDRESS && grantee_address?.trim().startsWith(this.prefixAdd))
      ) {
        this.isInvalidAddress = true;
        return false;
      }
    }

    if (this.periodShow) {
      this.errorSpendLimit = false;
      if (amount && +amount < +period_amount) {
        this.errorSpendLimit = true;
      }

      this.isInvalidPeriod = false;
      if (expiration_time && period_day) {
        let date = new Date(expiration_time.toISOString());
        let temp = +period_day - 1 > 0 ? (+period_day - 1) * this.dayConvert * 1000 : 0;
        if (+date.getTime() < +new Date().getTime() + temp) {
          this.isInvalidPeriod = true;
        }
      }

      if (!period_amount || !period_day || this.errorSpendLimit || this.isInvalidPeriod) {
        return false;
      }
    }

    if (!granter || !grantee_address) {
      return false;
    }

    //new flow check execute contract
    if (isExecute && !(execute_contract?.length >= 1 && execute_contract[0]?.address?.length > 0)) {
      return false;
    }

    this.isSubmit = false;
    this.formValid = true;
    return true;
  }

  removeTime() {
    this.grantForm.controls['expiration_time'].setValue(null);
    this.checkFormValid();
  }

  showNotice(granteeAddress: string, granterAddress: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    let dialogRef = this.dialog.open(PopupNoticeComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showRevoke(granteeAddress, granterAddress);
      }
    });
  }

  showRevoke(granteeAddress: string, granterAddress: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.data = {
      granterAddress: granterAddress,
      granteeAddress: granteeAddress,
    };
    let dialogRef = this.dialog.open(PopupRevokeComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toastr.loading(result);
        setTimeout(() => {
          this.isRevoking = false;
          this.mappingErrorService.checkDetailTx(result);
        }, 4000);
      }
    });
  }
}
