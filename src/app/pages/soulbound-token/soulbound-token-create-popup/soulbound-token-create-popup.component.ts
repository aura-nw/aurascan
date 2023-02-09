import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { isContract } from 'src/app/core/utils/common/validation';

@Component({
  selector: 'app-soulbound-token-create-popup',
  templateUrl: './soulbound-token-create-popup.component.html',
  styleUrls: ['./soulbound-token-create-popup.component.scss'],
})
export class SoulboundTokenCreatePopupComponent implements OnInit {
  createSBTokenForm: FormGroup;
  isAddressInvalid = false;
  isCurrentAddress = false;
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
    this.createSBTokenForm = new FormGroup({
      soulboundTokenURI: new FormControl('', Validators.required),
      receiverAddress: new FormControl('', Validators.required),
    });
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  resetCheck() {
    this.isAddressInvalid = false;
    this.isCurrentAddress = false;
  }

  async onSubmit() {
    const minter = this.walletService.wallet?.bech32Address;
    const { soulboundTokenURI, receiverAddress } = this.createSBTokenForm.value;

    if (!isContract(receiverAddress)) {
      this.isAddressInvalid = true;
      return;
    }

    if (receiverAddress === minter) {
      this.isCurrentAddress = true;
      return;
    }

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

  executeCreate(payload) {
    this.soulboundService.createSBToken(payload).subscribe(
      (res) => {
        if (res?.code) {
          let msgError = res?.message.toString() || 'Error';
          this.toastr.error(msgError);
        } else {
          this.toastr.success('Account Bound record added sucessfully');
        }
      },
      (error) => {
        this.toastr.error(error);
      },
    );
  }
}
