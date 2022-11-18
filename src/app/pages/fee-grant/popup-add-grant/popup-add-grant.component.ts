import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { StargateClient } from '@cosmjs/stargate';
import { WalletService } from 'src/app/core/services/wallet.service';
import { ESigningType, SIGNING_MESSAGE_TYPES } from 'src/app/core/constants/wallet.constant';
import * as moment from 'moment';

@Component({
  selector: 'app-popup-add-grant',
  templateUrl: './popup-add-grant.component.html',
  styleUrls: ['./popup-add-grant.component.scss'],
})
export class PopupAddGrantComponent implements OnInit {
  grantForm;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  periodShow = false;
  contractType: 'instantiate' | 'execute' = 'instantiate';
  allContractAllowActive = true;
  currDate;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { data: any },
    public dialogRef: MatDialogRef<PopupAddGrantComponent>,
    private fb: FormBuilder,
    private toastr: NgxToastrService,
    public environmentService: EnvironmentService,
    private walletService: WalletService,
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
    this.grantForm.controls[controlName].setValue(1000000);
  }

  closeDialog(hash = null) {
    this.dialogRef.close(hash);
  }

  changePeriodStage(stage: boolean) {
    this.periodShow = stage;
  }

  changeContractStage(contract: 'instantiate' | 'execute') {
    this.contractType = contract;
  }

  changeContractsActive(isAll: boolean) {
    this.allContractAllowActive = isAll;
  }

  async onSubmit() {
    const granter = this.walletService.wallet?.bech32Address;
    const { grantee_address, expiration_time, period_amount, period_day, amount, execute_contract } =
      this.grantForm.value;

    if (!granter) {
      return;
    }

    const executeStaking = async () => {
      const { hash, error } = await this.walletService.signAndBroadcast({
        messageType: SIGNING_MESSAGE_TYPES.GRANT_BASIC_ALLOWANCE,
        message: {
          granter,
          grantee: grantee_address,
          spendLimit: amount,
          expiration: expiration_time ? moment(expiration_time).toDate()?.getTime() : null,
        },
        senderAddress: granter,
        network: this.environmentService.configValue.chain_info,
        signingType: ESigningType.Keplr,
        chainId: this.walletService.chainId,
      });

      this.closeDialog(hash);
    };

    executeStaking();
  }

  addClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.add('border-white');
  }

  removeClassFocus(e: HTMLInputElement) {
    e.parentElement.classList.remove('border-white');
  }
}
