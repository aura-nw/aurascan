import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { EWalletType } from 'src/app/core/constants/wallet.constant';

@Component({
  selector: 'app-soulbound-token-create-popup',
  templateUrl: './soulbound-token-create-popup.component.html',
  styleUrls: ['./soulbound-token-create-popup.component.scss'],
})
export class SoulboundTokenCreatePopupComponent implements OnInit {
  createSBTokenForm: UntypedFormGroup;
  isAddressInvalid = false;
  isCurrentAddress = false;
  isReject = false;

  network = this.environmentService.chainInfo;
  prefix = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr?.toLowerCase();
  eWalletType = EWalletType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SoulboundTokenCreatePopupComponent>,
    private environmentService: EnvironmentService,
    private walletService: WalletService,
    private soulboundService: SoulboundService,
    private toastr: NgxToastrService,
    private commonService: CommonService,
  ) {}

  ngOnInit() {
    this.formInit();
  }

  formInit() {
    this.createSBTokenForm = new UntypedFormGroup({
      soulboundTokenURI: new UntypedFormControl('', Validators.required),
      receiverAddress: new UntypedFormControl('', Validators.required),
    });
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  resetCheck() {
    this.isAddressInvalid = false;
    this.isCurrentAddress = false;
    this.isReject = false;
  }

  async onSubmit() {
    const minter = this.walletService.walletAccount?.address;
    let { soulboundTokenURI, receiverAddress } = this.createSBTokenForm.value;
    soulboundTokenURI = soulboundTokenURI.trim();
    receiverAddress = receiverAddress.trim();

    if (!this.commonService.isBech32Address(receiverAddress)) {
      this.isAddressInvalid = true;
      return;
    }

    if (receiverAddress === minter) {
      this.isCurrentAddress = true;
      return;
    }

    this.checkReject(receiverAddress, minter, soulboundTokenURI);
  }

  executeCreate(payload) {
    this.soulboundService.createSBToken(payload).subscribe(
      (res) => {
        if (res?.code) {
          let msgError = res?.message.toString() || 'Error';
          this.toastr.error(msgError);
        } else {
          this.toastr.success('Account Bound record added successfully');
        }
      },
      (error) => {
        this.toastr.error(error);
      },
    );
  }

  checkReject(receiverAddress, minterAddress, soulboundTokenURI) {
    this.soulboundService.checkReject(receiverAddress, minterAddress).subscribe(
      (res) => {
        if (res?.code) {
          let msgError = res?.message.toString() || 'Error';
          this.toastr.error(msgError);
          this.isReject = true;
        } else {
          this.signWalletABT(receiverAddress, minterAddress, soulboundTokenURI);
        }
      },
      (error) => {
        this.toastr.error(error);
      },
    );
  }

  async signWalletABT(receiverAddress: string, minter: string, soulboundTokenURI: string) {
    const AGREEMENT = 'Agreement(string chain_id,address active,address passive,string tokenURI)';
    const message = AGREEMENT + this.network.chainId + receiverAddress + minter + soulboundTokenURI;
    let signResult = await this.walletService.signArbitrary(minter, message);

    const payload = {
      signature: signResult['signature'],
      msg: message,
      pubKey: signResult['pub_key']?.value,
      contract_address: this.data.contractAddress,
      receiver_address: receiverAddress,
      token_uri: soulboundTokenURI,
    };

    this.dialogRef.close();
    this.executeCreate(payload);
  }
}
