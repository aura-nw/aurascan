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
const amino = require('@cosmjs/amino');

@Component({
  selector: 'app-token-soulbound-create-popup',
  templateUrl: './token-soulbound-create-popup.component.html',
  styleUrls: ['./token-soulbound-create-popup.component.scss'],
})
export class TokenSoulboundCreatePopupComponent implements OnInit {
  createSBTokenForm: FormGroup;
  isSubmit = false;
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

  async onSubmit() {
    const minter = this.walletService.wallet?.bech32Address;
    const { soulboundTokenURI, receiverAddress } = this.createSBTokenForm.value;

    const keplr = await getKeplr();
    // const AGREEMENT = 'Agreement(address active,address passive,string tokenURI)';
    // let data = AGREEMENT + receiverAddress + minter + soulboundTokenURI;

    let data = this.createMessageToSign(this.network.chainId, receiverAddress, minter, soulboundTokenURI);

    let dataJson = {
      account_number: '0',
      chain_id: 'aura-testnet-2',
      fee: {
        amount: [],
        gas: '0',
      },
      memo: '',
      msgs: {
        type: 'sign/MsgSignData',
        value: {
          data: 'Agreement(address active,address passive,string tokenURI)aura1fqj2redmssckrdeekhkcvd2kzp9f4nks4fctrtaura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0nhttps://ipfs.io/ipfs/Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu',
          signer: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
        },
      },
      sequence: '0',
    };

    // let dataKeplr = await keplr.signAmino(this.network.chainId, minter, dataJson);
    // console.log(dataKeplr);

    console.log(JSON.stringify(data));

    // let dataTest = serializeSignDoc(data);
    // let dataKeplr = await keplr.signArbitrary(this.network.chainId, minter, JSON.stringify(dataJson));
    const message = "Create NFT token";
    let dataKeplr = await keplr.signArbitrary(this.network.chainId, minter, message);
    const payload = {
      signature: dataKeplr.signature,
      msg: message,
      pubKey: dataKeplr.pub_key.value,
      contract_address: this.data.contractAddress,
      receiver_address: receiverAddress,
      token_uri: soulboundTokenURI,
    };

    this.dialogRef.close();
    this.executeCreate(payload);
  }

  createMessageToSign(chainID, active, passive, uri) {
    const AGREEMENT = 'Agreement(address active,address passive,string tokenURI)';

    // create message to sign based on concating AGREEMENT, signer, receiver, and uri
    const message = {
      type: 'sign/MsgSignData',
      value: {
        signer: passive,
        data: AGREEMENT + active + passive + uri,
      },
    };

    const fee = {
      gas: '0',
      amount: [],
    };

    return amino.makeSignDoc(message, fee, chainID, '', 0, 0);
  }

  checkFormValid(): boolean {
    return true;
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
