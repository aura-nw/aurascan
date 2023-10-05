import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { isAddress, isContract } from 'src/app/core/utils/common/validation';

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
  network = this.environmentService.configValue.chain_info;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SoulboundTokenCreatePopupComponent>,
    private environmentService: EnvironmentService,
    private walletService: WalletService,
    private soulboundService: SoulboundService,
    private toastr: NgxToastrService,
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
    const minter = this.walletService.wallet?.bech32Address;
    let { soulboundTokenURI, receiverAddress } = this.createSBTokenForm.value;
    soulboundTokenURI = soulboundTokenURI.trim();
    receiverAddress = receiverAddress.trim();

    if (!isAddress(receiverAddress)) {
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

  async signWalletABT(receiverAddress, minter, soulboundTokenURI) {
    const AGREEMENT = 'Agreement(string chain_id,address active,address passive,string tokenURI)';
    const message = AGREEMENT + this.network.chainId + receiverAddress + minter + soulboundTokenURI;
    let dataWallet = await this.walletService.getWalletSign(minter, message);

    const payload = {
      signature: dataWallet['signature'],
      msg: message,
      pubKey: dataWallet['pub_key']?.value,
      contract_address: this.data.contractAddress,
      receiver_address: receiverAddress,
      token_uri: soulboundTokenURI,
    };

    this.dialogRef.close();
    this.executeCreate(payload);
  }
}
