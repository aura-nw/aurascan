import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { TranslateService } from '@ngx-translate/core';
import { MESSAGES_CODE, MESSAGES_CODE_CONTRACT } from 'src/app/core/constants/messages.constant';
import { ESigningType } from 'src/app/core/constants/wallet.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { getKeplr } from 'src/app/core/utils/keplr';
import { getSigner } from 'src/app/core/utils/signing/signer';
const amino = require('@cosmjs/amino');
import {DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import { GasPrice } from '@cosmjs/stargate';

@Component({
  selector: 'app-token-soulbound-detail-popup',
  templateUrl: './token-soulbound-detail-popup.component.html',
  styleUrls: ['./token-soulbound-detail-popup.component.scss'],
})
export class TokenSoulboundDetailPopupComponent implements OnInit {
  isError = false;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultImgToken = this.image_s3 + 'images/aura__ntf-default-img.png';
  network = this.environmentService.configValue.chain_info;
  currentAddress = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public soulboundDetail: any,
    public dialogRef: MatDialogRef<TokenSoulboundDetailPopupComponent>,
    private environmentService: EnvironmentService,
    public commonService: CommonService,
    private walletService: WalletService,
    private toastr: NgxToastrService,
    public translate: TranslateService,
  ) {}

  ngOnInit(): void {}

  error(): void {
    this.isError = true;
  }

  closeDialog() {
    this.dialogRef.close('canceled');
  }

  async equipSB() {
    this.currentAddress = this.walletService.wallet?.bech32Address;
    const keplr = await getKeplr();
    // let dataKeplr = await keplr.signArbitrary(this.network.chainId, this.currentAddress, this.soulboundDetail.token_id);

    // let messageToSign = this.createMessageToSign(
    //   this.network.chainId,
    //   'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
    //   this.currentAddress,
    //   this.soulboundDetail.token_uri,
    // );
    // console.log(messageToSign);

    // const signedDoc = await keplr.signAmino(this.network.chainId, this.currentAddress, messageToSign);

    // console.log(signedDoc);

    // const messageToSign = this.createMessageToSign(chainID, active, passive, uri);

    if (this.currentAddress) {
      const msgExecute = {
        take: {
          from: this.soulboundDetail.minter_address,
          uri: this.soulboundDetail.token_uri,
          signature: {
            hrp: 'utaura',
            pub_key: this.soulboundDetail.pub_key,
            signature: this.soulboundDetail.signature,
          },
        },
      };

      // console.log(msgExecute);
      // this.walletService.walletExecute(
      //   this.walletService.wallet.bech32Address,
      //   this.soulboundDetail.contract_address,
      //   msgExecute,
      // );

      await this.verifySignature()

      // const signer = getSigner(ESigningType.Keplr, this.walletService.chainInfo.chainId)
      //   .then((signer) => {
      //     return SigningCosmWasmClient.connectWithSigner(this.walletService.chainInfo.rpc, signer);
      //   })
      //   .then((client) => {
      //     return client.execute(
      //       this.walletService.wallet.bech32Address,
      //       this.soulboundDetail.contract_address,
      //       msgExecute,
      //       {
      //         amount: [
      //           {
      //             amount: '0.0025',
      //             denom: 'utaura',
      //           },
      //         ],
      //         gas: '500000',
      //       },
      //     );
      //   })
      //   .then((e) => {
      //     console.log('eee', e);
      //   })
      //   .catch((err) => {
      //     console.log('rrr', err);
      //   });

      // this.execute(msgExecute);
    }

    // const payload = {
    //   signature: dataKeplr.signature,
    //   msg: this.soulboundDetail.token_id,
    //   pubKey: dataKeplr.pub_key.value,
    //   id: this.soulboundDetail.token_id,
    //   status: this.soulboundDetail.status,
    // };

    // this.soulboundService.updatePickSBToken(payload).subscribe((res) => {
    //   if (res?.code) {
    //     let msgError = res?.message.toString() || 'Error';
    //     this.toastr.error(msgError);
    //   } else {
    //     this.toastr.success(MESSAGES_CODE.SUCCESSFUL.Message);
    //     this.dialogRef.close();
    //   }
    //   // this.getListSB();
    // });
  }

  async verifySignature(){
    const mnemonic = 'grief assault labor select faint leader impulse broken help garlic carry practice cricket cannon draw resist clump jar debris sentence notice poem drip benefit';
    

    const deployerWallet: any = await DirectSecp256k1HdWallet.fromMnemonic(
      this.auraTestnet.mnemonic,
      {
          prefix: this.auraTestnet.prefix
      }
  );

  const testerWallet: any = await DirectSecp256k1HdWallet.fromMnemonic(
    this.auraTestnet.tester_mnemonic,
      {
          prefix: this.auraTestnet.prefix
      }
  );
  
  const _uri = 'https://nft-ipfs-indexer.s3.ap-southeast-1.amazonaws.com/bafkreignkbivm4jeuaost7a4avdodiuzu7f2skpherns5xvgguget3ngci';

   // create message to sign
   const messageToSign = this.createMessageToSignv2(this.auraTestnet.chainId, deployerWallet.address, testerWallet.address, _uri);
   console.log("messageToSign: ", messageToSign);

   // sign message
   const permitSignature = await this.getPermitSignatureAmino(messageToSign, this.auraTestnet.mnemonic);
   console.log("permitSignature: ", permitSignature);

    // get tester account
    const testerAccount = (await testerWallet.getAccounts())[0];

    const memo = "take nft";
    // define the take message using the address of deployer, uri of the nft and permitSignature
    const ExecuteTakeMsg = {
        "take": {
            "from": 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
            "uri": _uri,
            "signature": permitSignature,
        }
    }

    console.log("ExecuteTakeMsg: ", ExecuteTakeMsg);

     // gas price
    const gasPrice = GasPrice.fromString(`0.025${this.auraTestnet.denom}`);

    // connect tester wallet to chain
    const testerClient = await SigningCosmWasmClient.connectWithSigner(this.auraTestnet.rpcEndpoint, testerWallet, { gasPrice });
    console.log("testerClient");
    console.log(testerClient);
    console.log('testerAccount.address:' + testerAccount.address)

    // take a NFT
   try{
    const takeResponse = await testerClient.execute(testerAccount.address, 
      'aura1x0a84jpqxkhfgvn8kxj4krtxrvdl23jnddante4xe848tqzhfu3sussem7', 
      ExecuteTakeMsg, 'auto',  memo);

    console.log(takeResponse);
   }catch(err){
    console.log(err);
   }
  }

  createMessageToSignv2(chainID, active, passive, uri) {
    const AGREEMENT = 'Agreement(address active,address passive,string tokenURI)';

    // create message to sign based on concating AGREEMENT, signer, receiver, and uri
    const message = AGREEMENT + active + passive + uri;

    const mess = {
        type: "sign/MsgSignData",
        value: {
            signer: String(passive),
            data: String(message)
        }
    };

    const fee = {
        gas: "0",
        amount: []
    };

    const messageToSign = amino.makeSignDoc(mess, fee, String(chainID), "", 0, 0);
    // console.log("amino.serializeSignDoc(messageToSign): ", toUtf8(amino.sortedJsonStringify(messageToSign)));

    return messageToSign;
}

  async getPermitSignatureAmino(messageToSign, mnemonic) {
    const signerWallet = await amino.Secp256k1HdWallet.fromMnemonic(
        mnemonic,
        {
            prefix: this.auraTestnet.prefix
        }
    );

    // const adminAccount = deployerWallet.getAccounts()[0];
      const signerAccount = (await signerWallet.getAccounts())[0];

      console.log('signerAccount.address: '+ signerAccount.address);
      
    // sign message
    const signedDoc = await signerWallet.signAmino(signerAccount.address, messageToSign);
    console.log("signedDoc: ", signedDoc);

    const decodedSignature = amino.decodeSignature(signedDoc.signature);
    console.log(decodedSignature);

    // pubkey must be compressed in base64
    let permitSignature = {
        "hrp": "aura",
        "pub_key": Buffer.from(signerAccount.pubkey).toString('base64'),
        "signature": signedDoc.signature.signature,
    }

    return permitSignature;
  } 

  auraTestnet = {
    rpcEndpoint: 'https://rpc.dev.aura.network',
    prefix: 'aura',
    denom: 'utaura',
    chainId: 'aura-testnet-2',
    broadcastTimeoutMs: 5000,
    broadcastPollIntervalMs: 1000,
    mnemonic: 'grief assault labor select faint leader impulse broken help garlic carry practice cricket cannon draw resist clump jar debris sentence notice poem drip benefit',
    tester_mnemonic: 'forward picnic antenna marble various tilt problem foil arrow animal oil salon catch artist tube dry noise door cliff grain fox left loan reopen'
  };

  execute(data) {
    let msgError = MESSAGES_CODE_CONTRACT[5].Message;
    msgError = msgError ? msgError.charAt(0).toUpperCase() + msgError.slice(1) : 'Error';
    try {
      this.walletService
        .execute(this.currentAddress, this.soulboundDetail.contract_address, data)
        .then((e) => {
          // msg.isLoading = false;
          if ((e as any).result?.error) {
            this.toastr.error(msgError);
          } else {
            if ((e as any)?.transactionHash) {
              this.toastr.loading((e as any)?.transactionHash);
              setTimeout(() => {
                this.toastr.success(this.translate.instant('NOTICE.SUCCESS_TRANSACTION'));
              }, 4000);
            }
          }
        })
        .catch((error) => {
          // msg.isLoading = false;
          if (!error.toString().includes('Request rejected')) {
            this.toastr.error(msgError);
          }
        });
    } catch (error) {
      this.toastr.error(`Error: ${msgError}`);
    }
  }
}
