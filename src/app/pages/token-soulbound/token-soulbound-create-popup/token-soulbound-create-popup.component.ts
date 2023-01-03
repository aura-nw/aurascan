import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MESSAGES_CODE } from 'src/app/core/constants/messages.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getKeplr } from 'src/app/core/utils/keplr';
import { serializeSignDoc } from '@cosmjs/amino';
import { isContract } from 'src/app/core/utils/common/validation';
const amino = require('@cosmjs/amino');

@Component({
  selector: 'app-token-soulbound-create-popup',
  templateUrl: './token-soulbound-create-popup.component.html',
  styleUrls: ['./token-soulbound-create-popup.component.scss'],
})
export class TokenSoulboundCreatePopupComponent implements OnInit {
  createSBTokenForm: FormGroup;
  isAddressInvalid = false;
  network = this.environmentService.configValue.chain_info;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TokenSoulboundCreatePopupComponent>,
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
  }

  async onSubmit() {
    const minter = this.walletService.wallet?.bech32Address;
    const { soulboundTokenURI, receiverAddress } = this.createSBTokenForm.value;

    if (!isContract(receiverAddress)) {
      this.isAddressInvalid = true;
      return;
    }

    const keplr = await getKeplr();
    const AGREEMENT = 'Agreement(string chain_id,address active,address passive,string tokenURI)';
    const message = AGREEMENT + this.network.chainId + receiverAddress + minter + soulboundTokenURI;
    let dataKeplr = await keplr.signArbitrary(this.network.chainId, minter, message);

    const payload = {
      signature: dataKeplr.signature,
      msg: message,
      pubKey: dataKeplr.pub_key.value,
      contract_address: this.data.contractAddress,
      receiver_address: receiverAddress,
      token_uri: soulboundTokenURI,
    };

    console.log('payload:', payload);
    

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
          this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
        }
      },
      (error) => {
        this.toastr.error(error);
      },
    );
  }
}
